import { OrderItem } from './order-item.model';

export interface BillItem extends OrderItem {
  unitPrice: number;
  totalPrice: number;
}