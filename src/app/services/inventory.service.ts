import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  productName: string;
  barcode: string | null;
  unit: string;
}

export interface ProductBatch {
  id: number;
  productId: number;
  batchNumber: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  expiryDate: string | null;
}

export interface ProductRequest {
  productName: string;
  barcode: string | null;
  unit: string;
}

export interface ProductBatchRequest {
  batchNumber: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  expiryDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private readonly API_URL =
    'http://localhost:2003/api/admin/inventory';

  constructor(private http: HttpClient) {}

  createProduct(
    request: ProductRequest
  ): Observable<Product> {

    return this.http.post<Product>(
      `${this.API_URL}/products`,
      request
    );
  }

  getAllProducts(): Observable<Product[]> {

    return this.http.get<Product[]>(
      `${this.API_URL}/products`
    );
  }

  getProduct(productId: number): Observable<Product> {

    return this.http.get<Product>(
      `${this.API_URL}/products/${productId}`
    );
  }

  findProductByBarcode(
    barcode: string
  ): Observable<Product> {

    return this.http.get<Product>(
      `${this.API_URL}/products/barcode/${encodeURIComponent(barcode)}`
    );
  }

  addBatch(
    productId: number,
    request: ProductBatchRequest
  ): Observable<ProductBatch> {

    return this.http.post<ProductBatch>(
      `${this.API_URL}/products/${productId}/batches`,
      request
    );
  }

  getProductBatches(
    productId: number
  ): Observable<ProductBatch[]> {

    return this.http.get<ProductBatch[]>(
      `${this.API_URL}/products/${productId}/batches`
    );
  }
}