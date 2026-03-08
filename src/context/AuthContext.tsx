import { auth, db, User, UserCredential } from '@/src/lib/firebase';
import { sendEmailVerification as sendWebEmailVerification } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: User | null;
  loading: boolean; // For async operations like login/signup
  authLoaded: boolean; // For the initial auth state check
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  resendVerification: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const reloadUser = async (authUser: any) => {
    if (!authUser) return;
    if (typeof authUser.reload === 'function') {
      await authUser.reload();
      return;
    }
  };

  const sendVerificationEmail = async (authUser: any) => {
    if (!authUser) {
      throw new Error('No authenticated user available for verification email.');
    }

    if (typeof authUser.sendEmailVerification === 'function') {
      await authUser.sendEmailVerification();
      return;
    }

    await sendWebEmailVerification(authUser);
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((firebaseUser: User | null) => {
      const syncAuthState = async () => {
        if (!firebaseUser) {
          setUser(null);
          if (!authLoaded) {
            setAuthLoaded(true);
          }
          return;
        }

        try {
          await reloadUser(firebaseUser);
          setUser(firebaseUser);
        } catch (error) {
          console.error('Auth state sync failed:', error);
          setUser(firebaseUser);
        } finally {
          if (!authLoaded) {
            setAuthLoaded(true);
          }
        }
      };

      syncAuthState();
    });

    return unsub;
  }, [authLoaded]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      await reloadUser(userCredential.user);

      if (userCredential.user.emailVerified === false) {
        await auth.signOut();
        const verificationError: any = new Error('Please verify your email before logging in.');
        verificationError.code = 'auth/email-not-verified';
        throw verificationError;
      }

      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const { user } = userCredential;

      await sendVerificationEmail(user);

      // Save user to Firestore with PHASE 1 concurrency control defaults
      const now = Timestamp.now();
      const userData: any = {
        userId: user.uid,
        email: user.email,
        // PHASE 1: Concurrency control fields
        maxCurrentCalls: 2, // Default for free tier
        currentActiveCalls: 0,
        tier: 'free', // Default tier
        demoEligible: true,
        demoUsed: false,
        hasSeenDemo: false,
        demoTranscriptViewed: false,
        createdAt: now,
        updatedAt: now,
      };

      // Only include displayName if it exists (Firestore doesn't allow undefined)
      if (user.displayName) {
        userData.displayName = user.displayName;
      }

      await setDoc(doc(db, 'users', user.uid), userData);
      await auth.signOut();
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      await reloadUser(userCredential.user);

      if (userCredential.user.emailVerified === true) {
        const alreadyVerifiedError: any = new Error('Email is already verified.');
        alreadyVerifiedError.code = 'auth/email-already-verified';
        throw alreadyVerifiedError;
      }

      await sendVerificationEmail(userCredential.user);
      await auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, authLoaded, loading, login, signup, resendVerification, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
