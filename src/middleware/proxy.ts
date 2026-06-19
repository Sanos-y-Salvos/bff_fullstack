import { Request, Response } from 'express';
import axios, { Method } from 'axios';

function buildUrl(base: string, path: string, query: any) {
  const url = base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  const params = new URLSearchParams(query).toString();
  return params ? `${url}?${params}` : url;
}

export default function proxyHandler(envVar: string, defaultUrl: string, stripPrefix?: string) {
  const base = process.env[envVar] || defaultUrl;

  return async (req: Request, res: Response) => {
    const attempted: string[] = [];
    const method = req.method as Method;
    const headers = { ...req.headers };
    // hop-by-hop headers must not be forwarded to upstream services
    delete (headers as any).host;
    delete (headers as any)['transfer-encoding'];
    delete (headers as any)['connection'];
    delete (headers as any)['keep-alive'];
    delete (headers as any)['proxy-authenticate'];
    delete (headers as any)['proxy-authorization'];
    delete (headers as any)['te'];
    delete (headers as any)['trailers'];
    delete (headers as any)['upgrade'];

    // Forward the raw, unparsed request stream so binary/multipart bodies
    // (e.g. file uploads) reach the upstream service byte-for-byte intact.
    const hasBody = !['GET', 'HEAD'].includes(method);

    const tryRequest = async (targetBase: string) => {
      // Remove the '/api' prefix when forwarding so upstream services receive their expected paths
      let forwardPath = req.originalUrl.replace(/^\/api/, '') || '/';
      if (stripPrefix) {
        forwardPath = forwardPath.replace(new RegExp(`^${stripPrefix}`), '') || '/';
      }
      const forwardUrl = buildUrl(targetBase, forwardPath, req.query);
      attempted.push(forwardUrl);
      return axios.request({
        url: forwardUrl,
        method,
        headers,
        data: hasBody ? req : undefined,
        responseType: 'arraybuffer',
        validateStatus: () => true
      });
    };

    // axios transparently decompresses the response, so content-encoding/length
    // from upstream no longer match the bytes we're about to send.
    const sendResponse = (resp: { status: number; headers: any; data: any }) => {
      const respHeaders = { ...resp.headers };
      delete respHeaders['content-encoding'];
      delete respHeaders['content-length'];
      delete respHeaders['transfer-encoding'];
      return res.status(resp.status).set(respHeaders).send(resp.data);
    };

    try {
      // First attempt with configured base
      const resp = await tryRequest(base);
      return sendResponse(resp);
    } catch (err: any) {
      console.error('Proxy first attempt error:', err && err.message ? err.message : err);

      // If connection refused to localhost, try host.docker.internal (useful on Docker for Windows)
      try {
        if ((base.includes('localhost') || base.includes('127.0.0.1')) && err && err.code === 'ECONNREFUSED') {
          const altBase = base.replace('localhost', 'host.docker.internal').replace('127.0.0.1', 'host.docker.internal');
          try {
            const resp2 = await tryRequest(altBase);
            return sendResponse(resp2);
          } catch (err2: any) {
            console.error('Proxy second attempt error:', err2 && err2.message ? err2.message : err2);
            return res.status(502).json({ error: 'Bad Gateway', details: { message: err2.message, code: err2.code, attempted } });
          }
        }

        return res.status(502).json({ error: 'Bad Gateway', details: { message: err.message, code: err.code, attempted } });
      } catch (finalErr: any) {
        console.error('Proxy final error:', finalErr);
        return res.status(500).json({ error: String(finalErr) });
      }
    }
  };
}
