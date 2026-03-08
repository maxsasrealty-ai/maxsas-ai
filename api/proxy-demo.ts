const DEMO_CALL_UPSTREAM_URL = 'https://165.22.222.202:5678/webhook/ringg-init';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const upstreamResponse = await fetch(DEMO_CALL_UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload ?? {}),
    });

    const responseText = await upstreamResponse.text();
    let responseBody: unknown = responseText;

    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseBody = responseText;
    }

    return res.status(upstreamResponse.status).json({
      ok: upstreamResponse.ok,
      data: responseBody,
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Proxy request failed',
    });
  }
}