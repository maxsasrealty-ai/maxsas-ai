import handler from './create-order';

const mockGetFirestore = jest.fn();
const mockVerifyIdToken = jest.fn();
const mockOrdersCreate = jest.fn();
const mockRazorpayCtor = jest.fn().mockImplementation(function RazorpayMock(this: any) {
  this.orders = {
    create: mockOrdersCreate,
  };
});
(mockRazorpayCtor as any).default = mockRazorpayCtor;

jest.mock('firebase-admin/app', () => ({
  applicationDefault: jest.fn(() => ({})),
  cert: jest.fn(() => ({})),
  getApps: jest.fn(() => [{ name: 'mock-admin-app' }]),
  initializeApp: jest.fn(() => ({ name: 'mock-admin-app' })),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: () => mockGetFirestore(),
  FieldValue: {
    serverTimestamp: jest.fn(() => '__SERVER_TIMESTAMP__'),
  },
}));

jest.mock('razorpay', () => ({
  __esModule: true,
  default: mockRazorpayCtor,
}));

type StoredDoc = Record<string, any>;

function createFakeDb() {
  const docs = new Map<string, StoredDoc>();

  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

  const setDoc = (path: string, data: StoredDoc) => {
    docs.set(path, clone(data));
  };

  const getDoc = (path: string) => {
    const value = docs.get(path);
    if (!value) return undefined;
    return clone(value);
  };

  return {
    collection: (name: string) => ({
      doc: (id: string) => ({
        path: `${name}/${id}`,
        async set(data: StoredDoc) {
          setDoc(`${name}/${id}`, data);
        },
      }),
    }),
    getAllDocs: () => [...docs.entries()].map(([path, data]) => ({ path, data: clone(data) })),
    getDoc,
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

describe('Razorpay create-order', () => {
  const previousEnv = {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  };

  beforeEach(() => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (previousEnv.RAZORPAY_KEY_ID === undefined) {
      delete process.env.RAZORPAY_KEY_ID;
    } else {
      process.env.RAZORPAY_KEY_ID = previousEnv.RAZORPAY_KEY_ID;
    }

    if (previousEnv.RAZORPAY_KEY_SECRET === undefined) {
      delete process.env.RAZORPAY_KEY_SECRET;
    } else {
      process.env.RAZORPAY_KEY_SECRET = previousEnv.RAZORPAY_KEY_SECRET;
    }
  });

  it('rejects request without Authorization bearer token', async () => {
    const fakeDb = createFakeDb();
    mockGetFirestore.mockReturnValue(fakeDb);

    const req: any = {
      method: 'POST',
      body: { amount: 245 },
      headers: {},
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.jsonPayload?.error).toMatch(/Missing Firebase ID token/i);
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects request when Firebase token verification fails', async () => {
    const fakeDb = createFakeDb();
    mockGetFirestore.mockReturnValue(fakeDb);
    mockVerifyIdToken.mockRejectedValue(new Error('token invalid'));

    const req: any = {
      method: 'POST',
      body: { amount: 245 },
      headers: {
        authorization: 'Bearer bad-token',
      },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.jsonPayload?.error).toMatch(/Invalid or expired Firebase ID token/i);
  });

  it('rejects non-integer amount in rupees', async () => {
    const fakeDb = createFakeDb();
    mockGetFirestore.mockReturnValue(fakeDb);
    mockVerifyIdToken.mockResolvedValue({ uid: 'user_verified' });

    const req: any = {
      method: 'POST',
      body: { amount: 245.5 },
      headers: {
        authorization: 'Bearer good-token',
      },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload?.error).toMatch(/integer number of rupees/i);
    expect(mockOrdersCreate).not.toHaveBeenCalled();
  });

  it('rejects amount outside allowed range', async () => {
    const fakeDb = createFakeDb();
    mockGetFirestore.mockReturnValue(fakeDb);
    mockVerifyIdToken.mockResolvedValue({ uid: 'user_verified' });

    const req: any = {
      method: 'POST',
      body: { amount: 9 },
      headers: {
        authorization: 'Bearer good-token',
      },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload?.error).toMatch(/between 10 and 100000/i);
    expect(mockOrdersCreate).not.toHaveBeenCalled();
  });

  it('accepts Authorization header casing and verifies token value', async () => {
    const fakeDb = createFakeDb();
    mockGetFirestore.mockReturnValue(fakeDb);
    mockVerifyIdToken.mockResolvedValue({ uid: 'user_from_token' });

    const req: any = {
      method: 'POST',
      body: {
        amount: 100001,
      },
      headers: {
        Authorization: 'Bearer valid-token-header',
      },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token-header');
    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload?.error).toMatch(/between 10 and 100000/i);
    expect(mockOrdersCreate).not.toHaveBeenCalled();
  });
});
