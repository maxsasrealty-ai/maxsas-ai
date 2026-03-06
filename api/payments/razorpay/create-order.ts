import { randomUUID } from 'crypto';

type SupportedPlatform = 'android' | 'ios' | 'web';

const SUPPORTED_PLATFORMS: SupportedPlatform[] = ['android', 'ios', 'web'];

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return NaN;
}

export default async function handler(req: any, res: any) {
  console.log('[CREATE_ORDER] request_received', {
    method: req?.method || null,
  });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  console.log('[CREATE_ORDER] env_loaded', {
    hasKeyId: !!keyId,
    hasKeySecret: !!keySecret,
  });

  if (!keyId || !keySecret) {
    console.error('[CREATE_ORDER] error', {
      reason: 'missing_razorpay_env',
    });

    return res.status(500).json({
      error: 'Razorpay credentials are not configured on server',
    });
  }

  try {
    let payload: any = {};

    if (typeof req.body === 'string') {
      try {
        payload = JSON.parse(req.body);
      } catch {
        console.error('[CREATE_ORDER] error', {
          reason: 'invalid_json_body',
        });

        return res.status(400).json({
          error: 'Invalid JSON body.',
        });
      }
    } else {
      payload = req.body ?? {};
    }

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

    const razorpayModule = await import('razorpay');
    const RazorpayCtor = (razorpayModule as any).default ?? razorpayModule;

    const razorpay = new RazorpayCtor({
      key_id: keyId,
      key_secret: keySecret,
    });

    console.log('[CREATE_ORDER] creating_razorpay_order', {
      amountInPaise,
      currency: 'INR',
    });

    let order: any;
    try {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      });
    } catch (orderError) {
      console.error('[CREATE_ORDER] error', {
        reason: 'razorpay_order_create_failed',
        message:
          orderError instanceof Error ? orderError.message : 'Unknown Razorpay order creation error',
      });

      return res.status(502).json({
        error:
          orderError instanceof Error
            ? orderError.message
            : 'Failed to create Razorpay order',
      });
    }

    console.log('[CREATE_ORDER] order_created', order?.id || null);

    return res.status(200).json({
      intentId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error('[CREATE_ORDER] error', {
      reason: 'unexpected_handler_error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Failed to create Razorpay order',
    });
  }
}
