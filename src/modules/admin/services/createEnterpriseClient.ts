import { db } from "@/src/lib/firebase";
import { getAuth } from "firebase/auth";
import {
    collection,
    getDocs,
    limit,
    query,
    where,
} from "firebase/firestore";
import { Platform } from "react-native";

export type CreateEnterpriseClientInput = {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  temporary_password: string;
  ai_provider: string;
  provider_agent_id: string;
  agent_name: string;
  language: string;
  voice: string;
  initial_wallet_credits: number;
  max_concurrent_calls: number;
  call_recording_enabled: boolean;
};

export type CreateEnterpriseClientResult = {
  client_id: string;
  agent_id: string;
  auth_uid: string;
};

function getApiUrl(path: string): string {
  const explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (explicitBaseUrl) {
    const normalizedBase = explicitBaseUrl.endsWith("/")
      ? explicitBaseUrl.slice(0, -1)
      : explicitBaseUrl;
    return `${normalizedBase}${path}`;
  }

  return path;
}

async function getCurrentIdToken(): Promise<string> {
  if (Platform.OS === "web") {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      throw new Error("Admin authentication required. Please login again.");
    }

    return currentUser.getIdToken();
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nativeAuth = require("@react-native-firebase/auth").default;
  const currentUser = nativeAuth().currentUser;

  if (!currentUser) {
    throw new Error("Admin authentication required. Please login again.");
  }

  return currentUser.getIdToken();
}

export const createEnterpriseClient = async (
  input: CreateEnterpriseClientInput
): Promise<CreateEnterpriseClientResult> => {
  const idToken = await getCurrentIdToken();
  const response = await fetch(getApiUrl("/api/admin/create-enterprise-client"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(input),
  });

  const body = (await response.json().catch(() => ({}))) as
    | CreateEnterpriseClientResult
    | { error?: string; message?: string };

  if (!response.ok) {
    const errorMessage = "error" in body && body.error ? body.error : "Failed to create enterprise client.";
    const fallbackMessage = "message" in body && body.message ? body.message : errorMessage;
    throw new Error(fallbackMessage);
  }

  if (!("client_id" in body) || !("agent_id" in body) || !("auth_uid" in body)) {
    throw new Error("Invalid response from create-enterprise-client API.");
  }

  return {
    client_id: body.client_id,
    agent_id: body.agent_id,
    auth_uid: body.auth_uid,
  };
};

export const isEnterpriseClientAuthUid = async (uid: string): Promise<boolean> => {
  if (!uid) {
    return false;
  }

  const snapshot = await getDocs(
    query(collection(db, "enterprise_clients"), where("auth_uid", "==", uid), limit(1))
  );

  return !snapshot.empty;
};
