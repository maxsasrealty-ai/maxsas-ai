import { randomUUID } from 'crypto';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return NaN;
}

function getPrivateKeyFromEnv(): string | null {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) return null;
  return raw.replace(/\\n/g, '\n');
}

function getOrInitAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKeyFromEnv();

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    ...(projectId ? { projectId } : {}),
  });
}

function getAdminDb() {
  return getFirestore(getOrInitAdminApp());
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

    const { amount, userId } = payload ?? {};

    console.log('[CREATE_ORDER] payload', {
      hasAmount: amount !== undefined,
      amount,
      userId,
    });

    const rawAmount = toNumber(amount);
    const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';

    if (!normalizedUserId) {
      console.error('[CREATE_ORDER] error', {
        reason: 'missing_user_id',
      });
      return res.status(400).json({
        error: 'userId is required.',
      });
    }

    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      console.error('[CREATE_ORDER] error', {
        reason: 'invalid_amount',
        amount,
      });
      return res.status(400).json({
        error: 'Invalid amount. Amount must be a positive number.',
      });
    }

    const amountInPaise = Math.round(rawAmount * 100);
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      console.error('[CREATE_ORDER] error', {
        reason: 'invalid_amount_after_conversion',
        amount: rawAmount,
        amountInPaise,
      });
      return res.status(400).json({
        error: 'Invalid amount after paise conversion.',
      });
    }

    console.log('[CREATE_ORDER] validation_passed', {
      userId: normalizedUserId,
      amountInRupees: rawAmount,
      amountInPaise,
      currency: 'INR',
    });

    const intentId = `pi_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const db = getAdminDb();
    const intentRef = db.collection('paymentIntents').doc(intentId);

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

      await intentRef.set({
        intentId,
        userId: normalizedUserId,
        amount: rawAmount,
        currency: 'INR',
        status: 'created',
        razorpayOrderId: order.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (err: any) {
      console.error('[CREATE_ORDER] error', {
        reason: 'razorpay_order_create_failed',
        message: err?.message,
        description: err?.error?.description,
        code: err?.error?.code,
        field: err?.error?.field,
        raw: err,
      });

      return res.status(502).json({
        error: 'razorpay_order_create_failed',
        message: err?.error?.description || err?.message || 'razorpay_order_error',
      });
    }

    console.log('[CREATE_ORDER] order_created', {
      intentId,
      orderId: order?.id || null,
      amount: order?.amount || null,
      userId: normalizedUserId,
    });

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
