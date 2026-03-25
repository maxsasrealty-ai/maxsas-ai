// n8n/webhook forwarding removed. This endpoint is deprecated.
export default function handler(req: any, res: any) {
  return res.status(410).json({ error: 'Webhook forwarding removed. Use backend-driven processing.' });
}