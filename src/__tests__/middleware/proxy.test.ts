import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import proxyHandler from '../../middleware/proxy';
import { Request, Response } from 'express';

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
  delete process.env.TEST_SERVICE_URL;
});

const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({
    method: 'GET',
    path: '/test',
    originalUrl: '/test',
    query: {},
    headers: { host: 'localhost', connection: 'keep-alive' },
    ...overrides,
  } as unknown as Request);

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// ── happy path ────────────────────────────────────────────────────────────────

describe('proxyHandler — happy path', () => {
  it('forwards GET and returns upstream response', async () => {
    mock.onGet('http://localhost:3001/test').reply(200, Buffer.from('ok'), { 'x-custom': '1' });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('reads base URL from env var when set', async () => {
    process.env.TEST_SERVICE_URL = 'http://envhost:9999';
    mock.onGet('http://envhost:9999/test').reply(200, Buffer.from('env'), {});
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('strips content-encoding and content-length from response headers', async () => {
    mock.onGet('http://localhost:3001/test').reply(200, Buffer.from('data'), {
      'content-encoding': 'gzip',
      'content-length': '4',
      'transfer-encoding': 'chunked',
      'x-keep': 'yes',
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const res = makeRes();
    await handler(makeReq(), res);
    const setArg = (res.set as jest.Mock).mock.calls[0][0];
    expect(setArg['content-encoding']).toBeUndefined();
    expect(setArg['content-length']).toBeUndefined();
    expect(setArg['x-keep']).toBe('yes');
  });

  it('strips hop-by-hop headers from forwarded request', async () => {
    let capturedHeaders: any;
    mock.onGet().reply((config: any) => {
      capturedHeaders = config.headers;
      return [200, Buffer.from('ok'), {}];
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const req = makeReq({
      headers: {
        host: 'localhost',
        connection: 'keep-alive',
        'keep-alive': '300',
        'transfer-encoding': 'chunked',
        'proxy-authenticate': 'Basic',
        'proxy-authorization': 'Bearer x',
        te: 'gzip',
        trailers: 'Max-Forwards',
        upgrade: 'websocket',
        authorization: 'Bearer tok',
      } as any,
    });
    await handler(req, makeRes());
    expect(capturedHeaders['host']).toBeUndefined();
    expect(capturedHeaders['connection']).toBeUndefined();
    expect(capturedHeaders['authorization']).toBe('Bearer tok');
  });

  it('appends query string to URL', async () => {
    let capturedUrl: string | undefined;
    mock.onGet().reply((config: any) => {
      capturedUrl = config.url;
      return [200, Buffer.from('ok'), {}];
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const req = makeReq({ query: { q: 'cat', page: '2' } as any });
    await handler(req, makeRes());
    expect(capturedUrl).toContain('q=cat');
    expect(capturedUrl).toContain('page=2');
  });

  it('strips prefix from path when stripPrefix is set', async () => {
    let capturedUrl: string | undefined;
    mock.onGet().reply((config: any) => {
      capturedUrl = config.url;
      return [200, Buffer.from('ok'), {}];
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001', '/mascotas');
    const req = makeReq({ path: '/mascotas/reportes/1' });
    await handler(req, makeRes());
    expect(capturedUrl).toContain('/reportes/1');
    expect(capturedUrl).not.toContain('/mascotas/reportes');
  });

  it('path equals only the prefix becomes /', async () => {
    let capturedUrl: string | undefined;
    mock.onGet().reply((config: any) => {
      capturedUrl = config.url;
      return [200, Buffer.from('ok'), {}];
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001', '/mascotas');
    const req = makeReq({ path: '/mascotas' });
    await handler(req, makeRes());
    expect(capturedUrl).toMatch(/localhost:3001\/?$/);
  });

  it('sends body for POST requests', async () => {
    let hadData = false;
    mock.onPost().reply((config: any) => {
      hadData = config.data !== undefined;
      return [201, Buffer.from('created'), {}];
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const req = makeReq({ method: 'POST', path: '/items' });
    await handler(req, makeRes());
    expect(hadData).toBe(true);
  });

  it('does not send body for HEAD requests', async () => {
    let capturedData: any = 'sentinel';
    mock.onAny().reply((config: any) => {
      capturedData = config.data;
      return [200, '', {}];
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const req = makeReq({ method: 'HEAD', path: '/test' });
    await handler(req, makeRes());
    expect(capturedData).toBeUndefined();
  });
});

// ── error paths ───────────────────────────────────────────────────────────────

describe('proxyHandler — error paths', () => {
  afterEach(() => jest.restoreAllMocks());

  it('retries with host.docker.internal on localhost ECONNREFUSED (success on retry)', async () => {
    let calls = 0;
    jest.spyOn(axios, 'request').mockImplementation(async (config: any) => {
      calls++;
      if (calls === 1) {
        const err: any = new Error('connect ECONNREFUSED');
        err.code = 'ECONNREFUSED';
        throw err;
      }
      return { status: 200, headers: {}, data: Buffer.from('ok2') } as any;
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 502 when docker.internal also fails (ECONNREFUSED + second failure with message)', async () => {
    let calls = 0;
    jest.spyOn(axios, 'request').mockImplementation(async () => {
      calls++;
      const err: any = new Error('connect ECONNREFUSED');
      err.code = 'ECONNREFUSED';
      throw err;
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Bad Gateway' }));
  });

  it('covers err2.message falsy branch (line 76) on second attempt failure', async () => {
    let calls = 0;
    jest.spyOn(axios, 'request').mockImplementation(async () => {
      calls++;
      if (calls === 1) {
        const err: any = new Error('connect ECONNREFUSED');
        err.code = 'ECONNREFUSED';
        throw err;
      }
      throw { code: 'ECONNREFUSED' }; // err2 has no .message
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://localhost:3001');
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('returns 502 when host is not localhost and request fails (with message)', async () => {
    jest.spyOn(axios, 'request').mockImplementation(async () => {
      const err: any = new Error('timeout');
      err.code = 'ETIMEDOUT';
      throw err;
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://remotehost:3001');
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('covers err.message falsy branch (line 66) when error has no message', async () => {
    jest.spyOn(axios, 'request').mockImplementation(async () => {
      throw { code: 'ECODE' }; // no .message property
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://remotehost:3001');
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('returns 500 when inner try-catch itself throws (finalErr path)', async () => {
    jest.spyOn(axios, 'request').mockImplementation(async () => {
      const err: any = new Error('upstream error');
      throw err;
    });
    const handler = proxyHandler('TEST_SERVICE_URL', 'http://remotehost:3001');
    const res = makeRes();
    // Make the first call to res.status (the 502 path) throw so that
    // the outer catch (finalErr) is reached and res.status(500) is called.
    (res.status as jest.Mock).mockImplementationOnce(() => {
      throw new Error('res.status exploded');
    });
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
