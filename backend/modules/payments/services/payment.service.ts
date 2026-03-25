import { v4 as uuidv4 } from 'uuid';
import { getActiveGateway } from '../../../config/paymentGateway.config';
import { PaymentRepository } from '../repositories/payment.repository';
import { Payment, PaymentPurpose } from '../types/payment.types';

export const PaymentService = {
  async createPaymentIntent({
    userId,
    tenantId,
    amount,
    currency,
    purpose,
    notes,
  }: {
    userId: string;
    tenantId: string;
    amount: number;
    currency: string;
    purpose: PaymentPurpose;
    notes?: any;
  }) {
    if (amount <= 0) throw new Error('Invalid amount');
    const gateway = await getActiveGateway();
    const paymentId = uuidv4();
    const payment: Payment = {
      id: paymentId,
      userId,
      tenantId,
      amount,
      currency,
      purpose,
      gateway: gateway.constructor.name.toLowerCase().replace('gateway', ''),
      gateway_order_id: '',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const order = await gateway.createOrder({
      amount,
      currency,
      receipt: paymentId,
      notes,
    });
    payment.gateway_order_id = order.id;
    await PaymentRepository.createPayment(payment);
    return { ...order, paymentId };
  },
};
