import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

type CreateEnterpriseClientPayload = {
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  temporary_password?: string;
  ai_provider?: string;
  provider_agent_id?: string;
  agent_name?: string;
  language?: string;
  voice?: string;
  initial_wallet_credits?: number;
  max_concurrent_calls?: number;
  call_recording_enabled?: boolean;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return fallback;
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

function getBearerTokenFromRequest(req: any): string {
  const rawHeader = req?.headers?.authorization || req?.headers?.Authorization;
  const header = typeof rawHeader === 'string' ? rawHeader.trim() : '';
  if (!header) {
    return '';
  }

  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || '';
}

const normalizeIdInput = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);

const randomSuffix = () => Math.random().toString(36).slice(2, 8);

const generateClientId = (companyName: string) => {
  const normalized = normalizeIdInput(companyName) || 'client';
  return `client_${normalized}_${Date.now().toString(36)}_${randomSuffix()}`;
};

const generateAgentId = () => `agent_${Date.now().toString(36)}_${randomSuffix()}`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const idToken = getBearerTokenFromRequest(req);
    if (!idToken) {
      return res.status(401).json({ error: 'Missing Firebase ID token in Authorization header.' });
    }

    const adminApp = getOrInitAdminApp();
    const adminAuth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    let actorUid = '';
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      actorUid = decodedToken.uid;
    } catch {
      return res.status(401).json({ error: 'Invalid or expired Firebase ID token.' });
    }

    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}) as CreateEnterpriseClientPayload;

    const companyName = toStringValue(payload.company_name);
    const contactPerson = toStringValue(payload.contact_person);
    const email = toStringValue(payload.email).toLowerCase();
    const phone = toStringValue(payload.phone);
    const temporaryPassword = toStringValue(payload.temporary_password);
    const aiProvider = toStringValue(payload.ai_provider || 'ringg').toLowerCase();
    const providerAgentId = toStringValue(payload.provider_agent_id);
    const agentName = toStringValue(payload.agent_name) || `${companyName} Agent`;
    const language = toStringValue(payload.language || 'English');
    const voice = toStringValue(payload.voice || 'Female');
    const initialWalletCredits = toNumber(payload.initial_wallet_credits, 0);
    const maxConcurrentCalls = Math.max(1, Math.floor(toNumber(payload.max_concurrent_calls, 5)));
    const callRecordingEnabled = toBoolean(payload.call_recording_enabled, true);

    if (!companyName || !contactPerson || !email || !temporaryPassword) {
      return res.status(400).json({ error: 'Missing required client details.' });
    }

    if (!providerAgentId) {
      return res.status(400).json({ error: 'provider_agent_id is required.' });
    }

    const userRecord = await adminAuth.createUser({
      email,
      password: temporaryPassword,
      displayName: contactPerson,
      disabled: false,
    });

    const auth_uid = userRecord.uid;
    const client_id = generateClientId(companyName);
    const agent_id = generateAgentId();
    const workspace_id = `workspace_${client_id}`;

    try {
      const batch = db.batch();

      const clientRef = db.collection('enterprise_clients').doc(client_id);
      const walletRef = db.collection('enterprise_wallets').doc(client_id);
      const agentRef = db.collection('enterprise_agents').doc(agent_id);
      const settingsRef = db.collection('enterprise_settings').doc(client_id);
      const userProfileRef = db.collection('users').doc(auth_uid);

      batch.set(clientRef, {
        client_id,
        company_name: companyName,
        contact_person: contactPerson,
        email,
        phone,
        auth_uid,
        status: 'active',
        workspace_id,
        ai_provider: aiProvider,
        created_by: actorUid,
        created_at: FieldValue.serverTimestamp(),
      });

      batch.set(walletRef, {
        client_id,
        balance: initialWalletCredits,
        currency: 'INR',
        billing_model: 'prepaid',
        created_at: FieldValue.serverTimestamp(),
      });

      batch.set(agentRef, {
        agent_id,
        client_id,
        provider: aiProvider,
        provider_agent_id: providerAgentId,
        agent_name: agentName,
        language,
        voice,
        script_version: 'v1',
        status: 'active',
        created_at: FieldValue.serverTimestamp(),
      });

      batch.set(settingsRef, {
        client_id,
        default_agent_id: agent_id,
        max_concurrent_calls: maxConcurrentCalls,
        call_recording_enabled: callRecordingEnabled,
        ai_provider: aiProvider,
        created_at: FieldValue.serverTimestamp(),
      });

      batch.set(
        userProfileRef,
        {
          userId: auth_uid,
          email,
          role: 'enterprise_client',
          plan: 'enterprise',
          enterpriseEnabled: true,
          enterpriseClientId: client_id,
          createdBy: actorUid,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      await batch.commit();

      return res.status(200).json({
        client_id,
        agent_id,
        auth_uid,
      });
    } catch (firestoreError) {
      // Roll back auth user if Firestore provisioning fails.
      await adminAuth.deleteUser(auth_uid).catch(() => undefined);
      throw firestoreError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Provisioning failed.';
    return res.status(500).json({ error: message });
  }
}
