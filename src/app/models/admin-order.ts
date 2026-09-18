export interface AdminOrder {

  id: number;

  orderNumber: string;

  userId: number;

  customerName: string;

  orderType: string;

  status: string;

  photoPath?: string | null;

  photoUrl?: string | null;

  photoNote?: string | null;

  createdAt: string;

  items: AdminOrderItem[];

  itemCount: number;

  // BILLING FIELDS
  totalAmount?: number | null;

  billedAt?: string | null;

  paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID';

paidAmount?: number | null;

remainingAmount?: number | null;

}


export interface AdminOrderItem {

  id: number;

  itemName: string;

  quantity: number;

  unit: string;

  // BILLING FIELDS
  unitPrice?: number | null;

  itemTotal?: number | null;

}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: 'CASH';
  paymentDate: string;
}