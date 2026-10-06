import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';


export interface InventorySummary {
  totalProducts: number;
  totalBatches: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  expiringSoonBatches: number;
  expiredBatches: number;
}

export interface InventoryValue {
  purchaseValue: number;
  sellingValue: number;
  potentialMargin: number;
  marginPercentage: number;
}


export interface LowStockProduct {
  productId: number;
  productName: string;
  barcode: string | null;
  unit: string;
  availableQuantity: number;
}


export interface ExpiringBatch {
  batchId: number;
  productId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  daysRemaining: number;
}


export interface InventoryDashboardData {
  summary: InventorySummary;
  value: InventoryValue;
  lowStockProducts: LowStockProduct[];
  expiringBatches: ExpiringBatch[];
  expiredBatches: ExpiringBatch[];
}


interface InventoryDashboardApiResponse {
  code: number;
  data: InventoryDashboardData;
  message: string;
  status: string;
}


@Injectable({
  providedIn: 'root'
})
export class InventoryDashboardService {

  private readonly API_URL =
    'http://localhost:2003/api/admin/dashboard/inventory';


  constructor(private http: HttpClient) {}


  getInventoryDashboard(): Observable<InventoryDashboardData> {

    return this.http
      .get<InventoryDashboardApiResponse>(this.API_URL)
      .pipe(
        map(response => response.data)
      );
  }
}