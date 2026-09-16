export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'OTHER';

export interface Payment {
  id: number;
  billId: number;
  customerId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
}