import http from 'node:http';

import handler from '../api/payments/razorpay/create-order';

const PORT = 4301;

const server = http.createServer((req, res) => {
  if (req.url !== '/api/payments/razorpay/create-order') {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const chunks: Buffer[] = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', async () => {
    const rawBody = Buffer.concat(chunks).toString('utf8');

    const mockReq: any = {
      method: req.method,
      body: rawBody,
      headers: req.headers,
    };

    const mockRes: any = {
      statusCode: 200,
      headers: {} as Record<string, string>,
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        res.writeHead(this.statusCode, {
          ...this.headers,
          'content-type': 'application/json',
        });
        res.end(JSON.stringify(payload));
      },
    };

    try {
      await handler(mockReq, mockRes);
    } catch (error) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unhandled error',
        })
      );
    }
  });
});

server.listen(PORT, () => {
  console.log(`Local test server running at http://localhost:${PORT}`);
});
