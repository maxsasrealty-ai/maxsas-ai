const { initializeApp, getApps, getApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc, serverTimestamp } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyD4RT1oEgcHEBOnAz35LnnzjlH3MATjW-k",
  authDomain: "real-estate-ai-agent-cbd9b.firebaseapp.com",
  projectId: "real-estate-ai-agent-cbd9b",
  storageBucket: "real-estate-ai-agent-cbd9b.firebasestorage.app",
  messagingSenderId: "72516441787",
  appId: "1:72516441787:web:278c4131b77abae438bb9e"
};

const EMAIL = "account@admin.com";
const PASSWORD = "B@8882453059@a";

(async () => {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  let user;
  let action = "created";

  try {
    const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
    user = cred.user;
  } catch (err) {
    const code = err && err.code ? err.code : "";
    if (code === "auth/email-already-in-use") {
      action = "existing";
      const cred = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
      user = cred.user;
    } else {
      throw err;
    }
  }

  await setDoc(doc(db, "users", user.uid), {
    userId: user.uid,
    email: EMAIL,
    role: "platform_admin",
    plan: "admin",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log(JSON.stringify({ ok: true, action, uid: user.uid, email: EMAIL, role: "platform_admin" }));
})().catch((err) => {
  console.error(JSON.stringify({ ok: false, code: err.code || null, message: err.message || String(err) }));
  process.exit(1);
});
