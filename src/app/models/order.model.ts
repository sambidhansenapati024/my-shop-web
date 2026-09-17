import { OrderItem } from './order-item.model';

import { OrderStatus } from './order-status.model';

export type OrderType = 'manual' | 'photo';

export interface Order {

  id: number;

  orderNumber: string;

  customerName: string;

  orderType: OrderType;

  items: OrderItem[];

  photoPreview: string | null;

  photoNote: string;

  status: OrderStatus;

  totalAmount: number | null;

  paidAmount: number;

  billedAt: Date | null;

  createdAt: Date;

}