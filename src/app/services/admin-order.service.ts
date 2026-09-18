
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AdminOrder, Payment } from '../models/admin-order';
import { OrderStatus } from '../models/order-status.model';
import { BillResponse } from '../models/bill-response';

export interface AdminOrdersResponse {
  code: number;
  message: string;
  data: AdminOrder[];
}

export interface AdminOrderResponse {
  code: number;
  message: string;
  data: AdminOrder;
}

export interface BillResponseWrapper {
  code: number;
  message: string;
  data: BillResponse[];
}

// Calculate Bill Request
export interface CalculateBillRequest {
  items: ItemPriceRequest[];
}

export interface ItemPriceRequest {
  itemId: number;
  unitPrice: number;
}

// Calculate Bill Response
export interface CalculateBillResponse {
  code: number;
  message: string;
  data: BillCalculation;
}

export interface BillCalculation {
  items: ItemCalculation[];
  totalAmount: number;
}

export interface ItemCalculation {
  itemId: number;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  itemTotal: number;
}

export interface GenerateBillResponse {
  code: number;
  message: string;
  data: number;
}

// Payment Request
export interface PaymentRequest {
  amount: number;
  paymentMethod: 'CASH';
}

// Payment Response
export interface PaymentResponse {
  code: number;
  message: string;
  data: AdminOrder;
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {

  private readonly API_URL =
    'http://localhost:2003/api/admin/orders';
    
  private readonly PAYMENT_API_URL =
    'http://localhost:2003/api/admin/payments/order';

  constructor(
    private http: HttpClient
  ) {}

  getAllOrders(): Observable<AdminOrdersResponse> {

    return this.http.get<AdminOrdersResponse>(
      this.API_URL
    );
  }

  getOrderById(
    orderId: number
  ): Observable<AdminOrderResponse> {

    return this.http.get<AdminOrderResponse>(
      `${this.API_URL}/${orderId}`
    );
  }

  updateOrderStatus(
    orderId: number,
    status: OrderStatus
  ): Observable<AdminOrderResponse> {

    return this.http.put<AdminOrderResponse>(
      `${this.API_URL}/${orderId}/status`,
      { status }
    );
  }

  calculateBill(
    orderId: number,
    request: CalculateBillRequest
  ): Observable<CalculateBillResponse> {

    return this.http.post<CalculateBillResponse>(
      `${this.API_URL}/${orderId}/calculate`,
      request
    );
  }

  generateBill(
  orderId: number,
  request: CalculateBillRequest
): Observable<GenerateBillResponse> {
  return this.http.post<GenerateBillResponse>(
    `${this.API_URL}/${orderId}/generate-bill`,
    request
  );
}

  makePayment(
  orderId: number,
  request: PaymentRequest
): Observable<PaymentResponse> {

  return this.http.post<PaymentResponse>(
    `${this.API_URL}/${orderId}/payment`,
    request
  );
}

  getPaymentsByOrderId(orderId: number): Observable<Payment[]> {
  return this.http.get<Payment[]>(
    `${this.PAYMENT_API_URL}/${orderId}`
  );
}

getAllBills(): Observable<BillResponseWrapper> {
  return this.http.get<BillResponseWrapper>(
    `${this.API_URL}/bills`
  );
}

}