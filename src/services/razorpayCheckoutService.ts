import { getAuth } from "firebase/auth";
import { Platform } from 'react-native';

type CreateOrderResponse = {
  intentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

type RechargeResult = {
  success: boolean;
  status: 'processing' | 'cancelled' | 'failed';
  errorMessage?: string;
};

type RazorpaySuccessResponse = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (payload: any) => void) => void;
    };
  }
}

function getApiUrl(path: string): string {
  const explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (explicitBaseUrl) {
    const normalizedBase = explicitBaseUrl.endsWith('/')
      ? explicitBaseUrl.slice(0, -1)
      : explicitBaseUrl;
    return `${normalizedBase}${path}`;
  }

  return path;
}

async function loadRazorpayScript(): Promise<void> {
  if (Platform.OS !== 'web') {
    throw new Error('Razorpay checkout is currently supported in web flow only.');
  }

  if (typeof window === 'undefined') {
    throw new Error('Web checkout is unavailable in this environment.');
  }

  if (window.Razorpay) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout script.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
    document.body.appendChild(script);
  });

  if (!window.Razorpay) {
    throw new Error('Razorpay checkout script loaded but SDK is unavailable.');
  }
}

async function createOrder(amount: number): Promise<CreateOrderResponse> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error('[RECHARGE] user not authenticated');
    throw new Error('User must be authenticated to create a recharge order.');
  }

  const amountInPaise = amount * 100;

  console.log('[RECHARGE] create_order_request', {
    userId: user.uid,
    amount,
  });

  const payload = {
    amount: amountInPaise,
    userId: user.uid,
  };

  const response = await fetch(getApiUrl('/api/payments/razorpay/create-order'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => ({}))) as Partial<CreateOrderResponse> & {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message || body.error || 'Failed to create Razorpay order.');
  }

  if (!body.intentId || !body.orderId || !body.amount || !body.currency || !body.keyId) {
    throw new Error('Invalid create-order response from server.');
  }

  return {
    intentId: body.intentId,
    orderId: body.orderId,
    amount: body.amount,
    currency: body.currency,
    keyId: body.keyId,
  };
}

async function openWebCheckout(order: CreateOrderResponse): Promise<RechargeResult> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    return {
      success: false,
      status: 'failed',
      errorMessage: 'Razorpay checkout is not available.',
    };
  }

  const RazorpayCheckout = window.Razorpay;

  return await new Promise<RechargeResult>((resolve) => {
    let resolved = false;

    const finalize = (result: RechargeResult) => {
      if (resolved) {
        return;
      }

      resolved = true;
      resolve(result);
    };

    const options: Record<string, unknown> = {
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: 'Maxsas Realty AI',
      description: 'AI Calling Wallet Recharge',
      handler: (response: RazorpaySuccessResponse) => {
        console.log('[RAZORPAY_CHECKOUT] payment_success', {
          intentId: order.intentId,
          orderId: response.razorpay_order_id || order.orderId,
          paymentId: response.razorpay_payment_id || null,
        });

        finalize({
          success: true,
          status: 'processing',
        });
      },
      modal: {
        ondismiss: () => {
          finalize({
            success: false,
            status: 'cancelled',
            errorMessage: 'Payment was cancelled.',
          });
        },
      },
    };

    const checkout = new RazorpayCheckout(options);
    checkout.on('payment.failed', (eventPayload: any) => {
      const reason = String(eventPayload?.error?.description || eventPayload?.error?.reason || 'Payment failed.');
      finalize({
        success: false,
        status: 'failed',
        errorMessage: reason,
      });
    });

    checkout.open();
  });
}

export async function startRazorpayRecharge(amount: number): Promise<RechargeResult> {
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      success: false,
      status: 'failed',
      errorMessage: 'Amount must be greater than 0.',
    };
  }

  try {
    const order = await createOrder(amount);

    if (Platform.OS !== 'web') {
      return {
        success: false,
        status: 'failed',
        errorMessage: 'Razorpay checkout is currently supported in web flow only.',
      };
    }

    return await openWebCheckout(order);
  } catch (error) {
    return {
      success: false,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unable to start recharge flow.',
    };
  }
}
