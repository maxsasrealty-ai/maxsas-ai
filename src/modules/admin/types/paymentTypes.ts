export type PaymentTransactionType =
  | "admin_credit"
  | "admin_debit"
  | "manual_payment"
  | "refund";

export type PaymentMethod =
  | "UPI"
  | "Bank Transfer"
  | "Cash"
  | "Manual Adjustment";

export interface PaymentTransaction {
  transactionId: string;
  userId: string;
  amount: number;
  type: PaymentTransactionType;
  paymentMethod: PaymentMethod;
  referenceId: string;
  notes: string;
  createdAt: string;
}
