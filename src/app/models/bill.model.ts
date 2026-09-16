import { BillItem } from './bill-item.model';

export type BillStatus =
  | 'GENERATED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'UNPAID';

export interface Bill {
  id: number;
  billNumber: string;
  orderId: number;
  customerId: number;
  items: BillItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BillStatus;
  createdAt: Date;
}