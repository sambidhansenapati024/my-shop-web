import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { OrderItem } from '../models/order-item.model';
import { OrderDraft } from './order-draft.service';


export interface Order {

  id: number;

  orderNumber: string;

  userId: number;

  customerName?: string;

  orderType: string;

  status: string;

  photoPath?: string;

  photoUrl?: string;

  photoNote?: string;

  createdAt: string;

  items: OrderItem[];

  totalAmount?: number | null;

  billedAt?: string | null;

  paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID';

paidAmount?: number | null;

remainingAmount?: number | null;

}


export interface OrderResponse {

  code: number;

  message: string;

  data: Order;

}


export interface MyOrdersResponse {

  code: number;

  message: string;

  data: Order[];

}


@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly API_URL =
    'http://localhost:2003/api/orders';


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // CREATE ORDER
  // ==========================================

  createOrder(draft: OrderDraft): Observable<OrderResponse> {
  const formData = new FormData();

  const orderData = {
  orderType: draft.orderType === 'manual' ? 'MANUAL' : 'PHOTO',

  items: draft.orderType === 'manual'
    ? draft.items.map(item => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit
      }))
    : [],

  photoNote: draft.orderType === 'photo'
    ? draft.photoNote
    : null
};
  const orderBlob = new Blob(
    [JSON.stringify(orderData)],
    {
      type: 'application/json'
    }
  );

  formData.append('order', orderBlob);

  if (
    draft.orderType === 'photo' &&
    draft.photo
  ) {
    formData.append(
      'photo',
      draft.photo
    );
  }

  return this.http.post<OrderResponse>(
    this.API_URL,
    formData
  );
}


  // ==========================================
  // GET MY ORDERS
  // ==========================================

  getMyOrders(): Observable<MyOrdersResponse> {

    return this.http.get<MyOrdersResponse>(
      `${this.API_URL}/getMyOrders`
    );

  }


  // ==========================================
  // GET SINGLE ORDER
  // ==========================================

  getOrderById(
    orderId: number
  ): Observable<OrderResponse> {

    return this.http.get<OrderResponse>(
      `${this.API_URL}/${orderId}`
    );

  }

}