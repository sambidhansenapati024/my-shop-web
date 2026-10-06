import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface DashboardSummary {
  averageBillValue: number;
  billCount: number;
  monthSales: number;
  todaySales: number;
  totalPaid: number;
  totalRemaining: number;
  totalSales: number;
}

export interface MonthlySales {
  month: string;
  year: number;
  salesAmount: number;
  paidAmount: number;
  remainingAmount: number;
  billCount: number;
}

export interface DailySales {
  date: string;
  salesAmount: number;
  paidAmount: number;
  remainingAmount: number;
  billCount: number;
}

export interface TopSellingItem {
  itemName: string;
  unit: string;
  quantitySold: number;
  salesAmount: number;
  numberOfBills: number;
}

export interface PaymentAnalysis {
  paidBillCount: number;
  partialBillCount: number;
  unpaidBillCount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface OrderAnalysis {
  customerOrders: number;
  manualBills: number;
  totalBills: number;
  statusCounts: {
    [status: string]: number;
  };
}

export interface RecentBill {
  id: number;
  billNumber: string;
  billType: 'ORDER' | 'MANUAL';
  customerName: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  billedAt: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  monthlySales: MonthlySales[];
  dailySales: DailySales[];
  topSellingItems: TopSellingItem[];
  paymentAnalysis: PaymentAnalysis;
  orderAnalysis: OrderAnalysis;
  recentBills: RecentBill[];
}

interface DashboardApiResponse {
  code: number;
  data: DashboardData;
  message: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly API_URL =
    'http://localhost:2003/api/admin/dashboard';

  constructor(
    private http: HttpClient
  ) {}

  getDashboard(): Observable<DashboardData> {

    return this.http
      .get<DashboardApiResponse>(this.API_URL)
      .pipe(
        map(response => response.data)
      );
  }
}