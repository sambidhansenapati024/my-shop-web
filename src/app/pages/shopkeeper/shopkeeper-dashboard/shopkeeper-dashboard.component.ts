import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import {
  DashboardData,
  DashboardService,
  DailySales,
  RecentBill
} from '../../../services/dashboard.service';
import {
  InventoryDashboardData,
  InventoryDashboardService
} from '../../../services/inventory-dashboard.service';

@Component({
  selector: 'app-shopkeeper-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shopkeeper-dashboard.component.html',
  styleUrl: './shopkeeper-dashboard.component.css'
})
export class ShopkeeperDashboardComponent implements OnInit, OnDestroy {

  dashboard: DashboardData | null = null;
  inventory: InventoryDashboardData | null = null;

  dailySales: DailySales[] = [];

  loading = true;
  error = false;

  inventoryLoading = true;
  inventoryError = false;

  lastUpdated: Date | null = null;

  private dashboardSubscription?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private inventoryDashboardService: InventoryDashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadInventoryDashboard();

    this.dashboardSubscription = timer(30000, 30000).subscribe(() => {
      this.loadDashboard();
      this.loadInventoryDashboard();
    });
  }

  loadDashboard(): void {
    this.error = false;

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.dailySales = data.dailySales ?? [];
        this.loading = false;
        this.lastUpdated = new Date();
      },
      error: (error) => {
        console.error('Failed to load dashboard:', error);
        this.loading = false;
        this.error = true;
      }
    });
  }

  loadInventoryDashboard(): void {
    this.inventoryError = false;

    this.inventoryDashboardService.getInventoryDashboard().subscribe({
      next: (data) => {
        this.inventory = data;
        this.inventoryLoading = false;
      },
      error: (error) => {
        console.error('Failed to load inventory dashboard:', error);
        this.inventoryLoading = false;
        this.inventoryError = true;
      }
    });
  }

  refreshDashboard(): void {
    this.loadDashboard();
    this.loadInventoryDashboard();
  }

  // =========================================================
  // SUMMARY
  // =========================================================

  get todaySales(): number {
    return this.dashboard?.summary?.todaySales ?? 0;
  }

  get monthSales(): number {
    return this.dashboard?.summary?.monthSales ?? 0;
  }

  get totalSales(): number {
    return this.dashboard?.summary?.totalSales ?? 0;
  }

  get totalPaid(): number {
    return this.dashboard?.summary?.totalPaid ?? 0;
  }

  get totalRemaining(): number {
    return this.dashboard?.summary?.totalRemaining ?? 0;
  }

  get billCount(): number {
    return this.dashboard?.summary?.billCount ?? 0;
  }

  get averageBillValue(): number {
    return this.dashboard?.summary?.averageBillValue ?? 0;
  }

  // =========================================================
  // DAILY SALES
  // =========================================================

  get maxDailySales(): number {
    if (this.dailySales.length === 0) {
      return 0;
    }

    return Math.max(
      ...this.dailySales.map(day => day.salesAmount),
      0
    );
  }

  getDailySalesBarHeight(salesAmount: number): number {
    if (this.maxDailySales <= 0 || salesAmount <= 0) {
      return 0;
    }

    return Math.round(
      (salesAmount / this.maxDailySales) * 100
    );
  }

  formatDayLabel(date: string): string {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString('en-IN', {
      weekday: 'short'
    });
  }

  formatChartDate(date: string): string {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  }

  get dailySalesTotal(): number {
    return this.dailySales.reduce(
      (total, day) => total + day.salesAmount,
      0
    );
  }

  get dailySalesPaid(): number {
    return this.dailySales.reduce(
      (total, day) => total + day.paidAmount,
      0
    );
  }

  get dailySalesRemaining(): number {
    return this.dailySales.reduce(
      (total, day) => total + day.remainingAmount,
      0
    );
  }

  get dailySalesBillCount(): number {
    return this.dailySales.reduce(
      (total, day) => total + day.billCount,
      0
    );
  }

  // =========================================================
  // MONTHLY SALES
  // =========================================================

  get monthlySales() {
    return this.dashboard?.monthlySales ?? [];
  }

  get maxMonthlySales(): number {
    if (this.monthlySales.length === 0) {
      return 0;
    }

    return Math.max(
      ...this.monthlySales.map(month => month.salesAmount),
      0
    );
  }

  getMonthlySalesBarHeight(salesAmount: number): number {
    if (this.maxMonthlySales <= 0 || salesAmount <= 0) {
      return 0;
    }

    return Math.round(
      (salesAmount / this.maxMonthlySales) * 100
    );
  }

  // =========================================================
  // PAYMENT
  // =========================================================

  get paidBillCount(): number {
    return this.dashboard?.paymentAnalysis?.paidBillCount ?? 0;
  }

  get partialBillCount(): number {
    return this.dashboard?.paymentAnalysis?.partialBillCount ?? 0;
  }

  get unpaidBillCount(): number {
    return this.dashboard?.paymentAnalysis?.unpaidBillCount ?? 0;
  }

  get paidAmount(): number {
    return this.dashboard?.paymentAnalysis?.paidAmount ?? 0;
  }

  get remainingAmount(): number {
    return this.dashboard?.paymentAnalysis?.remainingAmount ?? 0;
  }

  get totalPaymentStatusBills(): number {
    return (
      this.paidBillCount +
      this.partialBillCount +
      this.unpaidBillCount
    );
  }

  get paidBillPercentage(): number {
    if (this.totalPaymentStatusBills === 0) {
      return 0;
    }

    return (this.paidBillCount / this.totalPaymentStatusBills) * 100;
  }

  get partialBillPercentage(): number {
    if (this.totalPaymentStatusBills === 0) {
      return 0;
    }

    return (this.partialBillCount / this.totalPaymentStatusBills) * 100;
  }

  get unpaidBillPercentage(): number {
    if (this.totalPaymentStatusBills === 0) {
      return 0;
    }

    return (this.unpaidBillCount / this.totalPaymentStatusBills) * 100;
  }

  get collectionPercentage(): number {
    const total = this.paidAmount + this.remainingAmount;

    if (total <= 0) {
      return 0;
    }

    return Math.min((this.paidAmount / total) * 100, 100);
  }

  get paymentStatusChartStyle(): string {
    if (this.totalPaymentStatusBills === 0) {
      return 'conic-gradient(#e2e8f0 0deg 360deg)';
    }

    const paidDegrees = this.paidBillPercentage * 3.6;
    const partialDegrees =
      paidDegrees + (this.partialBillPercentage * 3.6);

    return `conic-gradient(
      #16a34a 0deg ${paidDegrees}deg,
      #f59e0b ${paidDegrees}deg ${partialDegrees}deg,
      #ef4444 ${partialDegrees}deg 360deg
    )`;
  }

  // =========================================================
  // ORDER & BILL ANALYSIS
  // =========================================================

  get customerOrders(): number {
    return this.dashboard?.orderAnalysis?.customerOrders ?? 0;
  }

  get manualBills(): number {
    return this.dashboard?.orderAnalysis?.manualBills ?? 0;
  }

  get totalBills(): number {
    return this.dashboard?.orderAnalysis?.totalBills ?? 0;
  }

  get customerOrderPercentage(): number {
    if (this.totalBills === 0) {
      return 0;
    }

    return Math.min(
      (this.customerOrders / this.totalBills) * 100,
      100
    );
  }

  get manualBillPercentage(): number {
    if (this.totalBills === 0) {
      return 0;
    }

    return Math.min(
      (this.manualBills / this.totalBills) * 100,
      100
    );
  }

  getStatusCount(status: string): number {
    return this.dashboard
      ?.orderAnalysis
      ?.statusCounts?.[status] ?? 0;
  }

  get newOrdersCount(): number {
    return this.getStatusCount('RECEIVED');
  }

  get preparingCount(): number {
    return this.getStatusCount('PACKING');
  }

  get readyCount(): number {
    return this.getStatusCount('READY');
  }

  get billedCount(): number {
    return this.getStatusCount('BILLED');
  }

  get billModifiedCount(): number {
    return this.getStatusCount('BILL_MODIFIED');
  }

  get completedCount(): number {
    return this.getStatusCount('COMPLETED');
  }

  get orderPipelineTotal(): number {
    return (
      this.newOrdersCount +
      this.preparingCount +
      this.readyCount +
      this.billedCount +
      this.billModifiedCount +
      this.completedCount
    );
  }

  getOrderStatusPercentage(count: number): number {
    if (this.orderPipelineTotal === 0) {
      return 0;
    }

    return Math.min(
      (count / this.orderPipelineTotal) * 100,
      100
    );
  }

  // =========================================================
  // TOP SELLING ITEMS
  // =========================================================

  get topSellingItems() {
    return this.dashboard?.topSellingItems ?? [];
  }

  get maxTopSellingAmount(): number {
    if (this.topSellingItems.length === 0) {
      return 0;
    }

    return Math.max(
      ...this.topSellingItems.map(item => item.salesAmount),
      0
    );
  }

  getTopSellingBarWidth(salesAmount: number): number {
    if (this.maxTopSellingAmount <= 0 || salesAmount <= 0) {
      return 0;
    }

    return Math.round(
      (salesAmount / this.maxTopSellingAmount) * 100
    );
  }

  // =========================================================
  // INVENTORY
  // =========================================================

  get totalProducts(): number {
    return this.inventory?.summary?.totalProducts ?? 0;
  }

  get totalBatches(): number {
    return this.inventory?.summary?.totalBatches ?? 0;
  }

  get lowStockProductsCount(): number {
    return this.inventory?.summary?.lowStockProducts ?? 0;
  }

  get outOfStockProductsCount(): number {
    return this.inventory?.summary?.outOfStockProducts ?? 0;
  }

  get expiringSoonBatchesCount(): number {
    return this.inventory?.summary?.expiringSoonBatches ?? 0;
  }

  get expiredBatchesCount(): number {
    return this.inventory?.summary?.expiredBatches ?? 0;
  }

  get lowStockProducts() {
    return this.inventory?.lowStockProducts ?? [];
  }

  get expiringBatches() {
    return this.inventory?.expiringBatches ?? [];
  }

  get expiredBatches() {
    return this.inventory?.expiredBatches ?? [];
  }

  get inventoryPurchaseValue(): number {
    return this.inventory?.value?.purchaseValue ?? 0;
  }

  get inventorySellingValue(): number {
    return this.inventory?.value?.sellingValue ?? 0;
  }

  get inventoryPotentialMargin(): number {
    return this.inventory?.value?.potentialMargin ?? 0;
  }

  get inventoryMarginPercentage(): number {
    return this.inventory?.value?.marginPercentage ?? 0;
  }

  // =========================================================
  // RECENT BILLS
  // =========================================================

  get recentBills(): RecentBill[] {
    return this.dashboard?.recentBills ?? [];
  }

  getPaymentStatusLabel(status: string | null): string {
    switch (status) {
      case 'PAID':
        return 'Paid';
      case 'PARTIAL':
        return 'Partial';
      case 'UNPAID':
        return 'Unpaid';
      default:
        return status || 'Unknown';
    }
  }

  getBillTypeLabel(billType: string): string {
    switch (billType) {
      case 'ORDER':
        return 'Customer Order';
      case 'MANUAL':
        return 'Manual Bill';
      default:
        return billType;
    }
  }

  getOrderStatusLabel(status: string): string {
    switch (status) {
      case 'RECEIVED':
        return 'New Order';
      case 'PACKING':
        return 'Preparing';
      case 'READY':
        return 'Ready';
      case 'BILLED':
        return 'Billed';
      case 'BILL_MODIFIED':
        return 'Bill Modified';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  }

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnDestroy(): void {
    this.dashboardSubscription?.unsubscribe();
  }
}
