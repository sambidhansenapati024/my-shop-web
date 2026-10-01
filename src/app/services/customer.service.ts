import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
  mobileNumber: string;
  email: string;
  totalOrders: number;
  outstandingAmount: number;
}

export interface CustomersResponse {
  code: number;
  message: string;
  data: Customer[];
}

export interface CustomerDetailsResponse {
  code: number;
  message: string;
  data: CustomerDetails;
}

export interface CustomerDetails {
  id: number;
  name: string;
  mobileNumber: string;
  email: string;
  totalOrders: number;
  outstandingAmount: number;
  orders: CustomerOrder[];
  payments: CustomerPayment[];
}

export interface CustomerOrder {
  id: number;
  orderNumber: string;
  orderType: string;
  status: string;
  totalAmount: number | null;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  createdAt: string;
  billedAt: string | null;
}

export interface CustomerPayment {
  id: number;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly API_URL =
    'http://localhost:2003/api/admin/customers';

  constructor(
    private http: HttpClient
  ) {}

  getAllCustomers(): Observable<CustomersResponse> {
    return this.http.get<CustomersResponse>(
      this.API_URL
    );
  }

  getCustomerDetails(
  customerId: number
): Observable<CustomerDetailsResponse> {

  return this.http.get<CustomerDetailsResponse>(
    `${this.API_URL}/${customerId}`
  );
}
}