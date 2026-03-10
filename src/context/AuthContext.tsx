import { auth, db, User, UserCredential } from '@/src/lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

import LoginRequiredModal from '@/src/components/auth/LoginRequiredModal';

type AuthContextType = {
  user: User | null;
  isGuest: boolean;
  loading: boolean; // For async operations like login/signup
  authLoaded: boolean; // For the initial auth state check
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  requireAuth: (action: () => void) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((firebaseUser: User | null) => {
      setUser(firebaseUser);
      setAuthLoaded(true);
    });

    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      return await auth.signInWithEmailAndPassword(email, password);
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
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Optimistically clear local auth state first so route guards can move to public pages immediately.
    setUser(null);
    setAuthLoaded(true);
    await auth.signOut();

    try {
      await AsyncStorage.multiRemove(['devLogin', 'devUserRole', 'devUserEmail']);
    } catch (storageError) {
      console.error('Failed to clear DEV session keys during logout:', storageError);
    }
  };

  const openLoginModal = () => setIsLoginModalVisible(true);
  const closeLoginModal = () => setIsLoginModalVisible(false);

  const requireAuth = (action: () => void) => {
    if (user) {
      action();
      return;
    }

    openLoginModal();
  };

  const isGuest = !user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        authLoaded,
        loading,
        login,
        signup,
        logout,
        requireAuth,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
      <LoginRequiredModal visible={isLoginModalVisible} onClose={closeLoginModal} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
