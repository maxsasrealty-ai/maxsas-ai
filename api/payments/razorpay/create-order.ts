import { randomUUID } from 'crypto';
import Razorpay from 'razorpay';

type SupportedPlatform = 'android' | 'ios' | 'web';

const SUPPORTED_PLATFORMS: SupportedPlatform[] = ['android', 'ios', 'web'];

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return NaN;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({
      error: 'Razorpay credentials are not configured on server',
    });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};

    const rawAmount = toNumber(payload.amount);
    const currency = String(payload.currency || 'INR').toUpperCase();
    const platform = String(payload.platform || '').toLowerCase();

    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount. Amount must be a positive number.',
      });
    }

    if (!SUPPORTED_PLATFORMS.includes(platform as SupportedPlatform)) {
      return res.status(400).json({
        error: 'Invalid platform. Supported values: android, ios, web.',
      });
    }

    if (currency !== 'INR') {
      return res.status(400).json({
        error: 'Invalid currency. Only INR is supported.',
      });
    }

    const amountInPaise = Math.round(rawAmount * 100);
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({
        error: 'Invalid amount after paise conversion.',
      });
    }

    const intentId = `pi_${Date.now()}_${randomUUID().slice(0, 8)}`;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: intentId,
      notes: {
        intentId,
        platform,
      },
    });

    return res.status(200).json({
      intentId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Failed to create Razorpay order',
    });
  }
}
