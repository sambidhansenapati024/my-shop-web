export interface Bill {
  id: number;

  billNumber: string;

  orderId: number;

  orderNumber: string;

  customerId: number;

  customerName: string;

  totalAmount: number;

  paidAmount: number;

  remainingAmount: number;

  paymentStatus:
    | 'UNPAID'
    | 'PARTIALLY_PAID'
    | 'PAID';

  createdAt: string;

  updatedAt?: string;
}