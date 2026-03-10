import { auth, db } from "@/src/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

const ENTERPRISE_TEST_EMAIL = "enterprise@test.com";
const ENTERPRISE_TEST_PASSWORD = "Test@123456";

type AuthError = {
  code?: string;
  message?: string;
};

const isEmailAlreadyInUseError = (error: unknown) => {
  const authError = error as AuthError;
  const code = authError?.code ?? "";
  const message = authError?.message ?? "";

  return (
    code === "auth/email-already-in-use" ||
    code === "email-already-in-use" ||
    message.includes("email-already-in-use")
  );
};

const ensureEnterpriseUserProfile = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  const now = Timestamp.now();

  await setDoc(
    userRef,
    {
      role: "enterprise_client",
      plan: "enterprise",
      enterpriseEnabled: true,
      createdAt: snapshot.exists() ? snapshot.data().createdAt ?? now : now,
      updatedAt: now,
    },
    { merge: true }
  );
};

// DEV ONLY: Enterprise testing access
// Remove before production
export const createEnterpriseTestUser = async () => {
  try {
    const credential = await auth.createUserWithEmailAndPassword(
      ENTERPRISE_TEST_EMAIL,
      ENTERPRISE_TEST_PASSWORD
    );

    await ensureEnterpriseUserProfile(credential.user.uid);
    return credential.user;
  } catch (error) {
    if (!isEmailAlreadyInUseError(error)) {
      throw error;
    }

    const credential = await auth.signInWithEmailAndPassword(
      ENTERPRISE_TEST_EMAIL,
      ENTERPRISE_TEST_PASSWORD
    );

    await ensureEnterpriseUserProfile(credential.user.uid);
    return credential.user;
  }
};
