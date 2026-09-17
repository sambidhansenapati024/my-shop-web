export interface Payment {
  id: number;

  paymentNumber: string;

  billId: number;

  billNumber: string;

  orderId: number;

  orderNumber: string;

  customerId: number;

  customerName: string;

  amount: number;

  paymentMethod:
    | 'CASH'
    | 'UPI'
    | 'CARD'
    | 'OTHER';

  paymentStatus:
    | 'SUCCESS'
    | 'PENDING'
    | 'FAILED';

  paymentDate: string;

  createdAt?: string;
}