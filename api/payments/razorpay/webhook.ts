import { createHmac, timingSafeEqual } from 'crypto';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';

import { FieldValue, getFirestore } from 'firebase-admin/firestore';

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };
    };
  };
};

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

function safeCompareHex(left: string, right: string): boolean {
  if (!/^[a-fA-F0-9]+$/.test(left) || !/^[a-fA-F0-9]+$/.test(right)) {
    return false;
  }

  const leftBuf = Buffer.from(left, 'hex');
  const rightBuf = Buffer.from(right, 'hex');

  if (leftBuf.length !== rightBuf.length) {
    return false;
  }

  return timingSafeEqual(leftBuf, rightBuf);
}

async function getRawBody(req: any): Promise<string> {
  if (typeof req.body === 'string') {
    return req.body;
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body.toString('utf8');
  }

  if (req.body && typeof req.body === 'object') {
    return JSON.stringify(req.body);
  }

  return await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', (error: Error) => {
      reject(error);
    });
  });
}

function normalizeIntentAmount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Number(value.toFixed(2));
}

function normalizeWebhookAmountFromPaise(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Number((value / 100).toFixed(2));
}

export default async function handler(req: any, res: any) {
  console.log('[RAZORPAY_WEBHOOK] request_received', {
    method: req.method,
  });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ error: 'RAZORPAY_WEBHOOK_SECRET is not configured' });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = String(req.headers['x-razorpay-signature'] || '');

    console.log('[RAZORPAY_WEBHOOK] signature_received', {
      hasSignature: !!signature,
    });

    if (!signature) {
      console.warn('[RAZORPAY_WEBHOOK] signature_verification_failed', {
        reason: 'missing_signature_header',
      });
      return res.status(401).json({ error: 'Missing Razorpay webhook signature' });
    }

    const expectedSignature = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    const isValidSignature = safeCompareHex(expectedSignature, signature);

    console.log('[RAZORPAY_WEBHOOK] signature_verification', {
      passed: isValidSignature,
    });

    if (!isValidSignature) {
      console.warn('[RAZORPAY_WEBHOOK] signature_verification_failed', {
        reason: 'invalid_signature',
      });
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody) as RazorpayWebhookEvent;
    const eventType = String(event.event || 'unknown');

    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    const paymentId = String(paymentEntity?.id || '');
    const orderId = String(paymentEntity?.order_id || orderEntity?.id || '');

    console.log('[RAZORPAY_WEBHOOK] event_parsed', {
      eventType,
      orderId: orderId || null,
      paymentId: paymentId || null,
    });

    const handledEvent = eventType === 'payment.captured' || eventType === 'order.paid';
    if (!handledEvent) {
      console.log('[RAZORPAY_WEBHOOK] event_ignored', {
        reason: 'unhandled_event_type',
        eventType,
        orderId: orderId || null,
        paymentId: paymentId || null,
      });
      return res.status(200).json({ ok: true, ignored: true, eventType });
    }

    if (!orderId && !paymentId) {
      console.warn('[RAZORPAY_WEBHOOK] event_rejected', {
        reason: 'missing_order_or_payment_id',
        eventType,
      });
      return res.status(400).json({ error: 'Missing order_id/payment_id in webhook payload' });
    }

    console.log('[RAZORPAY_WEBHOOK] settlement_start', {
      eventType,
      orderId: orderId || null,
      paymentId: paymentId || null,
    });

    const db = getAdminDb();

    let intentSnap: { id: string } | null = null;

    if (orderId) {
      const byOrder = await db
        .collection('paymentIntents')
        .where('razorpayOrderId', '==', orderId)
        .limit(1)
        .get();

      if (!byOrder.empty) {
        intentSnap = byOrder.docs[0];
        console.log('[RAZORPAY_WEBHOOK] intent_lookup_success', {
          strategy: 'order_id',
          intentId: intentSnap.id,
          orderId,
          paymentId: paymentId || null,
        });
      }
    }

    if (!intentSnap && paymentId) {
      const byPayment = await db
        .collection('paymentIntents')
        .where('razorpayPaymentId', '==', paymentId)
        .limit(1)
        .get();

      if (!byPayment.empty) {
        intentSnap = byPayment.docs[0];
        console.log('[RAZORPAY_WEBHOOK] intent_lookup_success', {
          strategy: 'payment_id',
          intentId: intentSnap.id,
          orderId: orderId || null,
          paymentId,
        });
      }
    }

    if (!intentSnap) {
      console.warn('[RAZORPAY_WEBHOOK] intent_lookup_failed', {
        orderId: orderId || null,
        paymentId: paymentId || null,
      });

      return res.status(200).json({ ok: true, ignored: true, reason: 'intent_not_found' });
    }

    const intentId = intentSnap.id;
    const intentRef = db.collection('paymentIntents').doc(intentId);

    const transactionResult = await db.runTransaction(async (transaction) => {
      const latestIntentSnap = await transaction.get(intentRef);
      if (!latestIntentSnap.exists) {
        throw new Error('Payment intent not found in transaction');
      }

      const intentData = latestIntentSnap.data() || {};
      const status = String(intentData.status || 'created').toLowerCase();
      const userId = String(intentData.userId || '');

      if (!userId) {
        throw new Error('Payment intent has no userId');
      }

      const amountFromWebhook = normalizeWebhookAmountFromPaise(
        paymentEntity?.amount || orderEntity?.amount
      );
      const amountFromIntent = normalizeIntentAmount(intentData.amount);
      const amountFromIntentPaise = normalizeWebhookAmountFromPaise(
        intentData.amountInPaise || intentData.amountPaise
      );
      const amount = amountFromWebhook || amountFromIntent || amountFromIntentPaise;

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Invalid recharge amount in payment intent/webhook');
      }

      const walletRef = db.collection('wallets').doc(userId);
      const walletTxnRef = walletRef.collection('transactions').doc(`recharge_${intentId}`);

      const walletSnap = await transaction.get(walletRef);
      const existingRechargeSnap = await transaction.get(walletTxnRef);

      if (status === 'credited' || existingRechargeSnap.exists) {
        console.log('[RAZORPAY_WEBHOOK] settlement_idempotent_skip', {
          intentId,
          userId,
          amount,
          reason: status === 'credited' ? 'intent_already_credited' : 'recharge_transaction_exists',
        });

        transaction.set(
          intentRef,
          {
            status: 'credited',
            razorpayPaymentId: paymentId || intentData.razorpayPaymentId || null,
            razorpayOrderId: orderId || intentData.razorpayOrderId || null,
            creditedAt: intentData.creditedAt || FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            lastWebhookEvent: eventType,
            lastWebhookAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        return {
          credited: false,
          alreadyCredited: true,
          intentId,
          userId,
          amount,
        };
      }

      const walletData = walletSnap.exists ? walletSnap.data() || {} : {};
      const previousBalance = Number(walletData.balance || 0);
      const previousTotalRecharged = Number(walletData.totalRecharged || 0);
      const lockedAmount = Number(walletData.lockedAmount || 0);
      const totalSpent = Number(walletData.totalSpent || 0);

      const newBalance = Number((previousBalance + amount).toFixed(2));
      const newTotalRecharged = Number((previousTotalRecharged + amount).toFixed(2));

      transaction.set(
        walletRef,
        {
          userId,
          balance: newBalance,
          totalRecharged: newTotalRecharged,
          lockedAmount,
          totalSpent,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      transaction.set(walletTxnRef, {
        transactionId: `recharge_${intentId}`,
        userId,
        type: 'recharge',
        amount,
        paymentId: paymentId || null,
        orderId: orderId || null,
        previousBalance,
        newBalance,
        description: `Razorpay recharge for intent ${intentId}`,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.set(
        intentRef,
        {
          status: 'credited',
          razorpayPaymentId: paymentId || null,
          razorpayOrderId: orderId || null,
          creditedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          lastWebhookEvent: eventType,
          lastWebhookAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return {
        credited: true,
        alreadyCredited: false,
        intentId,
        userId,
        amount,
      };
    });

    if (transactionResult.credited) {
      console.log('[RAZORPAY_WEBHOOK] settlement_wallet_credited', {
        intentId: transactionResult.intentId,
        userId: transactionResult.userId,
        amountCredited: transactionResult.amount,
        orderId: orderId || null,
        paymentId: paymentId || null,
      });
    } else if (transactionResult.alreadyCredited) {
      console.log('[RAZORPAY_WEBHOOK] settlement_already_processed', {
        intentId: transactionResult.intentId,
        userId: transactionResult.userId,
        amount: transactionResult.amount,
      });
    }

    console.log('[RAZORPAY_WEBHOOK] settlement_complete', {
      eventType,
      intentId: transactionResult.intentId,
      credited: transactionResult.credited,
      alreadyCredited: transactionResult.alreadyCredited,
    });

    return res.status(200).json({
      ok: true,
      eventType,
      result: transactionResult,
    });
  } catch (error) {
    console.error('[RAZORPAY_WEBHOOK] settlement_failed', {
      error: error instanceof Error ? error.message : 'Webhook settlement failed',
    });
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Webhook settlement failed',
    });
  }
}
