import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BillingProduct {
  id: number;
  productName: string;
  barcode: string | null;
  unit: string;
}

export interface BillingProductBatch {
  id: number;
  productId: number;
  batchNumber: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  expiryDate: string | null;
}

export interface ManualBillItem {
  id: number;
  productId: number;
  productBatchId: number;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface ManualBill {
  id: number;
  billNumber: string;
  customerName: string | null;
  customerMobile: string | null;

  subtotal: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';

  createdAt: string;
  updatedAt: string;
  billedAt: string | null;
  items: ManualBillItem[];
}

export interface CreateManualBillRequest {
  customerName: string | null;
  customerMobile: string | null;
}

export interface ManualBillItemRequest {
  productId: number;
  productBatchId: number;
  quantity: number;
}

export interface ManualBillPaymentRequest {
  paidAmount: number;
   paymentMethod: string;
}

export interface ManualBillPayment {
  id: number;
  amount: number;
  paymentMethod: string;
  paidAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManualBillingService {

  private readonly API_URL =
    'http://localhost:2003/api/admin/billing';

  constructor(
    private http: HttpClient
  ) {}

  // -----------------------------
  // Product
  // -----------------------------

  findProductByBarcode(
    barcode: string
  ): Observable<BillingProduct> {

    return this.http.get<BillingProduct>(
      `${this.API_URL}/products/barcode/${encodeURIComponent(barcode)}`
    );
  }

  getAvailableBatches(
    productId: number
  ): Observable<BillingProductBatch[]> {

    return this.http.get<BillingProductBatch[]>(
      `${this.API_URL}/products/${productId}/batches`
    );
  }

  // -----------------------------
  // Bill
  // -----------------------------

  createBill(
    request: CreateManualBillRequest
  ): Observable<ManualBill> {

    return this.http.post<ManualBill>(
      `${this.API_URL}/bills`,
      request
    );
  }

  getBill(
    billId: number
  ): Observable<ManualBill> {

    return this.http.get<ManualBill>(
      `${this.API_URL}/bills/${billId}`
    );
  }

  // -----------------------------
  // Bill Items
  // -----------------------------

  addItem(
    billId: number,
    request: ManualBillItemRequest
  ): Observable<ManualBill> {

    return this.http.post<ManualBill>(
      `${this.API_URL}/bills/${billId}/items`,
      request
    );
  }

  removeItem(
    billId: number,
    itemId: number
  ): Observable<ManualBill> {

    return this.http.delete<ManualBill>(
      `${this.API_URL}/bills/${billId}/items/${itemId}`
    );
  }

  getAllProducts(): Observable<BillingProduct[]> {

  return this.http.get<BillingProduct[]>(
    `${this.API_URL}/products`
  );
}

processPayment(
  billId: number,
  request: ManualBillPaymentRequest
): Observable<ManualBill> {

  return this.http.post<ManualBill>(
    `${this.API_URL}/bills/${billId}/payment`,
    request
  );
}

downloadBillPdf(billId: number): Observable<Blob> {

  return this.http.get(
    `${this.API_URL}/bills/${billId}/pdf`,
    {
      responseType: 'blob'
    }
  );
}

generateBill(billId: number): Observable<ManualBill> {
  return this.http.post<ManualBill>(
    `${this.API_URL}/bills/${billId}/generate`,
    {}
  );
}
getPaymentHistory(
  billId: number
): Observable<ManualBillPayment[]> {
  return this.http.get<ManualBillPayment[]>(
    `${this.API_URL}/bills/${billId}/payments`
  );
}

}