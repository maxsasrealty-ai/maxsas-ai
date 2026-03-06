import { createHmac } from 'crypto';

import handler from './webhook';

const mockGetFirestore = jest.fn();

jest.mock('firebase-admin/app', () => ({
  applicationDefault: jest.fn(() => ({})),
  cert: jest.fn(() => ({})),
  getApps: jest.fn(() => [{ name: 'mock-admin-app' }]),
  initializeApp: jest.fn(() => ({ name: 'mock-admin-app' })),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: () => mockGetFirestore(),
  FieldValue: {
    serverTimestamp: jest.fn(() => '__SERVER_TIMESTAMP__'),
  },
}));

type StoredDoc = Record<string, any>;

type FakeDb = {
  seed: (path: string, data: StoredDoc) => void;
  getDoc: (path: string) => StoredDoc | undefined;
  collection: (name: string) => any;
  runTransaction: (callback: (tx: any) => Promise<any>) => Promise<any>;
};

function createFakeDb(): FakeDb {
  const docs = new Map<string, StoredDoc>();

  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

  const getDoc = (path: string) => {
    const value = docs.get(path);
    if (!value) return undefined;
    return clone(value);
  };

  const setDoc = (path: string, data: StoredDoc, merge?: boolean) => {
    if (!merge) {
      docs.set(path, clone(data));
      return;
    }

    const existing = docs.get(path) || {};
    docs.set(path, { ...clone(existing), ...clone(data) });
  };

  const makeDocRef = (path: string) => ({
    path,
    id: path.split('/').pop() || '',
    collection: (child: string) => ({
      doc: (id: string) => makeDocRef(`${path}/${child}/${id}`),
    }),
  });

  const collection = (name: string) => ({
    doc: (id: string) => makeDocRef(`${name}/${id}`),
    where: (field: string, op: string, value: any) => {
      const clauses: { field: string; op: string; value: any }[] = [{ field, op, value }];
      return {
        limit: (count: number) => ({
          get: async () => {
            const prefix = `${name}/`;
            const matches = [...docs.entries()]
              .filter(([path, payload]) => {
                if (!path.startsWith(prefix)) {
                  return false;
                }

                const slashCount = path.split('/').length;
                if (slashCount !== 2) {
                  return false;
                }

                return clauses.every((clause) => {
                  if (clause.op !== '==') return false;
                  return payload?.[clause.field] === clause.value;
                });
              })
              .slice(0, count)
              .map(([path, payload]) => ({
                id: path.split('/')[1],
                data: () => clone(payload),
                exists: true,
              }));

            return {
              empty: matches.length === 0,
              docs: matches,
            };
          },
        }),
      };
    },
  });

  const runTransaction = async (callback: (tx: any) => Promise<any>) => {
    const tx = {
      get: async (ref: { path: string; id: string }) => {
        const payload = getDoc(ref.path);
        return {
          exists: !!payload,
          id: ref.id,
          data: () => (payload ? clone(payload) : undefined),
        };
      },
      set: (ref: { path: string }, data: StoredDoc, options?: { merge?: boolean }) => {
        setDoc(ref.path, data, options?.merge);
      },
    };

    return callback(tx);
  };

  return {
    seed: (path: string, data: StoredDoc) => setDoc(path, data),
    getDoc,
    collection,
    runTransaction,
  };
}

function createMockRes() {
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    jsonPayload: null as any,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.jsonPayload = payload;
      return this;
    },
  };

  return res;
}

describe('Razorpay webhook settlement', () => {
  const previousSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (previousSecret === undefined) {
      delete process.env.RAZORPAY_WEBHOOK_SECRET;
      return;
    }

    process.env.RAZORPAY_WEBHOOK_SECRET = previousSecret;
  });

  it('rejects webhook when signature is invalid', async () => {
    const fakeDb = createFakeDb();
    mockGetFirestore.mockReturnValue(fakeDb);

    const rawBody = JSON.stringify({ event: 'payment.captured' });
    const req: any = {
      method: 'POST',
      body: rawBody,
      headers: {
        'x-razorpay-signature': 'invalid-signature',
      },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.jsonPayload).toEqual({ error: 'Invalid webhook signature' });
  });

  it('credits wallet once and stays idempotent on duplicate delivery', async () => {
    const fakeDb = createFakeDb();
    mockGetFirestore.mockReturnValue(fakeDb);

    fakeDb.seed('paymentIntents/pi_1', {
      userId: 'user_1',
      amount: 500,
      status: 'payment_captured',
      razorpayOrderId: 'order_123',
    });

    fakeDb.seed('wallets/user_1', {
      userId: 'user_1',
      balance: 200,
      totalRecharged: 1000,
      lockedAmount: 0,
      totalSpent: 0,
    });

    const rawBody = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_123',
            order_id: 'order_123',
            amount: 50000,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    });

    const signature = createHmac('sha256', 'test_webhook_secret').update(rawBody).digest('hex');

    const firstReq: any = {
      method: 'POST',
      body: rawBody,
      headers: {
        'x-razorpay-signature': signature,
      },
    };

    const firstRes = createMockRes();
    await handler(firstReq, firstRes);

    expect(firstRes.statusCode).toBe(200);
    expect(firstRes.jsonPayload?.ok).toBe(true);
    expect(firstRes.jsonPayload?.result?.credited).toBe(true);

    const walletAfterFirst = fakeDb.getDoc('wallets/user_1');
    expect(walletAfterFirst?.balance).toBe(700);
    expect(walletAfterFirst?.totalRecharged).toBe(1500);

    const rechargeTxn = fakeDb.getDoc('wallets/user_1/transactions/recharge_pi_1');
    expect(rechargeTxn).toMatchObject({
      type: 'recharge',
      source: 'razorpay',
      amount: 500,
      razorpayPaymentId: 'pay_123',
      razorpayOrderId: 'order_123',
      paymentId: 'pay_123',
      orderId: 'order_123',
      createdAt: '__SERVER_TIMESTAMP__',
    });

    const intentAfterFirst = fakeDb.getDoc('paymentIntents/pi_1');
    expect(intentAfterFirst?.status).toBe('credited');
    expect(intentAfterFirst?.credited).toBe(true);
    expect(intentAfterFirst?.razorpayPaymentId).toBe('pay_123');
    expect(intentAfterFirst?.razorpayOrderId).toBe('order_123');

    const secondReq: any = {
      method: 'POST',
      body: rawBody,
      headers: {
        'x-razorpay-signature': signature,
      },
    };

    const secondRes = createMockRes();
    await handler(secondReq, secondRes);

    expect(secondRes.statusCode).toBe(200);
    expect(secondRes.jsonPayload?.result?.alreadyCredited).toBe(true);

    const walletAfterSecond = fakeDb.getDoc('wallets/user_1');
    expect(walletAfterSecond?.balance).toBe(700);
    expect(walletAfterSecond?.totalRecharged).toBe(1500);
  });
});
