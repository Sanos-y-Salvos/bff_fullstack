import { Request, Response } from 'express';
import axios, { Method } from 'axios';

function buildUrl(base: string, path: string, query: any) {
  const url = base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  const params = new URLSearchParams(query).toString();
  return params ? `${url}?${params}` : url;
}

export default function proxyHandler(envVar: string, defaultUrl: string) {
  const base = process.env[envVar] || defaultUrl;

  return async (req: Request, res: Response) => {
    const attempted: string[] = [];
    const method = req.method as Method;
    const headers = { ...req.headers };
    delete (headers as any).host;
    // Remove headers that may interfere when axios re-sends the request
    delete (headers as any)['content-length'];
    delete (headers as any)['transfer-encoding'];
    delete (headers as any)['content-encoding'];

    const tryRequest = async (targetBase: string) => {
      // Remove the '/api' prefix when forwarding so upstream services receive their expected paths
      const forwardPath = req.originalUrl.replace(/^\/api/, '') || '/';
      const forwardUrl = buildUrl(targetBase, forwardPath, req.query);
      attempted.push(forwardUrl);
      return axios.request({
        url: forwardUrl,
        method,
        headers,
        data: req.body,
        validateStatus: () => true
      });
    };

    try {
      // First attempt with configured base
      const resp = await tryRequest(base);
      return res.status(resp.status).set(resp.headers).send(resp.data);
    } catch (err: any) {
      console.error('Proxy first attempt error:', err && err.message ? err.message : err);

      // If connection refused to localhost, try host.docker.internal (useful on Docker for Windows)
      try {
        if ((base.includes('localhost') || base.includes('127.0.0.1')) && err && err.code === 'ECONNREFUSED') {
          const altBase = base.replace('localhost', 'host.docker.internal').replace('127.0.0.1', 'host.docker.internal');
          try {
            const resp2 = await tryRequest(altBase);
            return res.status(resp2.status).set(resp2.headers).send(resp2.data);
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
