import { randomUUID } from 'crypto';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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

function getBearerTokenFromRequest(req: any): string {
  const rawHeader = req?.headers?.authorization || req?.headers?.Authorization;
  const header = typeof rawHeader === 'string' ? rawHeader.trim() : '';
  if (!header) {
    return '';
  }

  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || '';
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

    const { amount } = payload ?? {};
    const idToken = getBearerTokenFromRequest(req);

    console.log('[CREATE_ORDER] payload', {
      hasAmount: amount !== undefined,
      amount,
      hasAuthorizationHeader: !!idToken,
    });

    const rawAmount = toNumber(amount);
    if (!idToken) {
      console.error('[CREATE_ORDER] error', {
        reason: 'missing_firebase_id_token',
      });
      return res.status(401).json({
        error: 'Missing Firebase ID token in Authorization header.',
      });
    }

    let normalizedUserId = '';
    try {
      console.log('[CREATE_ORDER] verifying_token', {
        tokenPrefix: idToken.substring(0, 20) + '...',
      });
      const decodedToken = await getAuth(getOrInitAdminApp()).verifyIdToken(idToken);
      normalizedUserId = decodedToken.uid;
      console.log('[CREATE_ORDER] token_verified', {
        userId: normalizedUserId,
      });
    } catch (error) {
      console.error('[CREATE_ORDER] error', {
        reason: 'invalid_firebase_id_token',
        message: error instanceof Error ? error.message : 'token_verification_failed',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(401).json({
        error: 'Invalid or expired Firebase ID token.',
      });
    }

    if (!normalizedUserId) {
      console.error('[CREATE_ORDER] error', {
        reason: 'missing_uid_in_verified_token',
      });
      return res.status(401).json({
        error: 'Authenticated user id could not be determined.',
      });
    }

    if (!Number.isInteger(rawAmount)) {
      console.error('[CREATE_ORDER] error', {
        reason: 'invalid_amount',
        amount,
      });
      return res.status(400).json({
        error: 'Invalid amount. Amount must be an integer number of rupees.',
      });
    }

    if (rawAmount < 10 || rawAmount > 100000) {
      console.error('[CREATE_ORDER] error', {
        reason: 'amount_out_of_range',
        amount: rawAmount,
      });
      return res.status(400).json({
        error: 'Invalid amount. Amount must be between 10 and 100000 rupees.',
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
        amountInPaise,
        currency: 'INR',
        status: 'created',
        credited: false,
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
