import { getAuth } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    calculateDeductionPreview,
    checkBalanceBeforeBatch,
    COST_PER_CALL,
    subscribeToTransactions,
    subscribeToWallet,
} from '../services/walletService';
import { Wallet, WalletOperationResult, WalletTransaction } from '../types/batch';
import { useAuth } from './AuthContext';

type WalletContextType = {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
  
  // Computed values
  availableBalance: number;
  
  // Actions
  checkBalance: (totalContacts: number) => Promise<WalletOperationResult>;
  addBalanceToWallet: (amount: number) => Promise<WalletOperationResult>;
  getDeductionPreview: (totalContacts: number) => number;
  refreshWallet: () => void;
  
  // Constants
  costPerCall: number;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time wallet subscription
  useEffect(() => {
    if (!user?.uid) {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('💳 Setting up wallet subscription for user:', user.uid);

    // Subscribe to wallet changes
    const unsubscribeWallet = subscribeToWallet(user.uid, (walletData) => {
      console.log('💰 Wallet updated:', walletData);
      setWallet(walletData);
      setLoading(false);
    });

    // Subscribe to transaction history
    const unsubscribeTransactions = subscribeToTransactions(user.uid, (txns) => {
      console.log('📝 Transactions updated:', txns.length);
      setTransactions(txns);
    });

    return () => {
      console.log('🔌 Cleaning up wallet subscriptions');
      unsubscribeWallet();
      unsubscribeTransactions();
    };
  }, [user?.uid]);

  // Computed: Available balance
  const availableBalance = wallet
    ? (wallet.balance - wallet.lockedAmount)
    : 0;

  // Check balance before batch
  const checkBalance = async (totalContacts: number): Promise<WalletOperationResult> => {
    const fallbackUserId = user?.uid ?? getAuth().currentUser?.uid;
    if (!fallbackUserId) {
      return {
        success: false,
        errorMessage: 'User not authenticated',
      };
    }

    return await checkBalanceBeforeBatch(fallbackUserId, totalContacts);
  };

  // Add balance to wallet
  const addBalanceToWallet = async (amount: number): Promise<WalletOperationResult> => {
    if (!amount || amount <= 0) {
      return {
        success: false,
        errorMessage: 'Amount must be greater than 0',
      };
    }

    return {
      success: false,
      errorMessage: 'Wallet top-ups are handled by automation.',
    };
  };

  // Get deduction preview
  const getDeductionPreview = (totalContacts: number): number => {
    return calculateDeductionPreview(totalContacts);
  };

  // Manual refresh (usually not needed with real-time)
  const refreshWallet = () => {
    console.log('🔄 Manual wallet refresh requested (real-time listener active)');
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        loading,
        error,
        availableBalance,
        checkBalance,
        addBalanceToWallet,
        getDeductionPreview,
        refreshWallet,
        costPerCall: COST_PER_CALL,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
