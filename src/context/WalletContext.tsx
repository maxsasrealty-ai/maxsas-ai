import { getAuth } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { startRazorpayRecharge } from '../services/razorpayCheckoutService';
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

    // Subscribe to wallet changes
    const unsubscribeWallet = subscribeToWallet(user.uid, (walletData) => {
      setWallet(walletData);
      setLoading(false);
    });

    // Subscribe to transaction history
    const unsubscribeTransactions = subscribeToTransactions(user.uid, (txns) => {
      setTransactions(txns);
    });

    return () => {
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

    const result = await startRazorpayRecharge(amount);
    if (!result.success) {
      return {
        success: false,
        errorMessage: result.errorMessage || 'Failed to start Razorpay checkout.',
      };
    }

    return {
      success: true,
    };
  };

  // Get deduction preview
  const getDeductionPreview = (totalContacts: number): number => {
    return calculateDeductionPreview(totalContacts);
  };

  // Manual refresh (usually not needed with real-time)
  const refreshWallet = () => {
    // No-op: wallet is already synced via real-time listeners.
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
