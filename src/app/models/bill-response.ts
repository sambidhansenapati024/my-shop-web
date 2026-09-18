import { AdminOrderItem } from './admin-order';

export interface BillResponse {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  status: string;

  createdAt: string;
  billedAt: string;

  items: AdminOrderItem[];
  itemCount: number;

  totalAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paidAmount: number;
  remainingAmount: number;
}