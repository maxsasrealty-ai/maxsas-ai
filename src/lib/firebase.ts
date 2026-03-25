import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Web imports
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User as WebUser,
    UserCredential as WebUserCredential,
} from 'firebase/auth';

// Type imports only (no runtime import for native on web)
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD4RT1oEgcHEBOnAz35LnnzjlH3MATjW-k',
  authDomain: 'real-estate-ai-agent-cbd9b.firebaseapp.com',
  projectId: 'real-estate-ai-agent-cbd9b',
  storageBucket: 'real-estate-ai-agent-cbd9b.firebasestorage.app',
  messagingSenderId: '72516441787',
  appId: '1:72516441787:web:278c4131b77abae438bb9e',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export const getCurrentUserId = () => {
  if (Platform.OS === 'web') {
    return getAuth(app).currentUser?.uid ?? null;
  } else {
    // For native platforms, import at runtime
    try {
       
      const nativeAuth = require('@react-native-firebase/auth').default;
      return nativeAuth().currentUser?.uid ?? null;
    } catch (error) {
      console.error('Error getting native auth:', error);
      return null;
    }
  }
};

// Helper to remove undefined values from objects
const cleanData = (obj: any): any => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

/**
 * @deprecated This function is deprecated and should not be used.
 * All leads MUST be created as part of a batch using the batch system.
 * Use BatchContext.createLocalBatch() and saveBatchToFirebase() instead.
 * 
 * Direct lead creation violates the batch-first architecture.
 * Firestore rules enforce that all leads must have a batchId.
 */
export const addLead = async (leadData: any) => {
  console.warn('⚠️ DEPRECATED: addLead() is deprecated. Use batch system instead.');
  throw new Error(
    'Direct lead creation is not allowed. All leads must be created through batches. ' +
    'Use BatchContext.createLocalBatch() followed by saveBatchToFirebase().'
  );
};


// Create a cross-platform auth wrapper
let authWrapper: any;

if (Platform.OS === 'web') {
  const webAuth = getAuth(app);
  authWrapper = {
    onAuthStateChanged: (callback: any) => onAuthStateChanged(webAuth, callback),
    signInWithEmailAndPassword: (email: string, password: string) =>
      signInWithEmailAndPassword(webAuth, email, password),
    createUserWithEmailAndPassword: (email: string, password: string) =>
      createUserWithEmailAndPassword(webAuth, email, password),
    signOut: () => signOut(webAuth),
  };
} else {
  // Dynamic import for native platforms only
  try {
     
    const nativeAuth = require('@react-native-firebase/auth').default;
    authWrapper = {
      onAuthStateChanged: (callback: any) => nativeAuth().onAuthStateChanged(callback),
      signInWithEmailAndPassword: (email: string, password: string) =>
        nativeAuth().signInWithEmailAndPassword(email, password),
      createUserWithEmailAndPassword: (email: string, password: string) =>
        nativeAuth().createUserWithEmailAndPassword(email, password),
      signOut: () => nativeAuth().signOut(),
    };
  } catch (error) {
    console.error('Error loading native Firebase auth:', error);
    authWrapper = {
      onAuthStateChanged: () => {},
      signInWithEmailAndPassword: async () => { throw new Error('Native auth not available'); },
      createUserWithEmailAndPassword: async () => { throw new Error('Native auth not available'); },
      signOut: async () => { throw new Error('Native auth not available'); },
    };
  }
}

export const auth = authWrapper;
export type User = WebUser | FirebaseAuthTypes.User;
export type UserCredential = WebUserCredential | FirebaseAuthTypes.UserCredential;

