
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminOrder } from '../../../models/admin-order';
import { AdminOrderService, BillManagement } from '../../../services/admin-order.service';
import { Router } from '@angular/router';
import { BillResponse } from '../../../models/bill-response';


@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent implements OnInit {

  selectedFilter:
    | 'ALL'
    | 'UNPAID'
    | 'PARTIAL'
    | 'PAID' = 'ALL';

  searchText = '';

  bills: BillManagement[] = [];

  isLoading = false;

  errorMessage = '';

  constructor(
    private adminOrderService: AdminOrderService,
     private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.adminOrderService.getAllBillManagement().subscribe({
    next: (response) => {

      this.bills = response.data || [];

      this.isLoading = false;
    },

    error: (error) => {

      console.error(
        'Failed to load bill management:',
        error
      );

      this.errorMessage =
        'Unable to load bills.';

      this.isLoading = false;
    }
  });
}

  get filteredBills(): BillManagement[] {

  let result = this.bills;

  // Payment status filter
  if (this.selectedFilter !== 'ALL') {
    result = result.filter(
      bill =>
        bill.paymentStatus === this.selectedFilter
    );
  }

  // Search
  const search =
    this.searchText.trim().toLowerCase();

  if (search) {

    result = result.filter(bill => {

      const billNumber =
        bill.billNumber?.toLowerCase() || '';

      const customerName =
        bill.customerName?.toLowerCase() || '';

      const orderNumber =
        bill.orderNumber?.toLowerCase() || '';

      const id =
        String(bill.id);

      return (
        billNumber.includes(search) ||
        customerName.includes(search) ||
        orderNumber.includes(search) ||
        id.includes(search)
      );
    });
  }

  return result;
}

  setFilter(
    filter: 'ALL' | 'UNPAID' | 'PARTIAL' | 'PAID'
  ): void {

    this.selectedFilter = filter;
  }

  getPaymentStatusLabel(status?: string | null): string {

    switch (status?.toUpperCase()) {

      case 'UNPAID':
        return 'Unpaid';

      case 'PARTIAL':
        return 'Partially Paid';

      case 'PAID':
        return 'Paid';

      default:
        return status || 'Unknown';
    }
  }

  getPaymentStatusClass(status?: string | null): string {

    switch (status?.toUpperCase()) {

      case 'UNPAID':
        return 'unpaid';

      case 'PARTIAL':
        return 'partially-paid';

      case 'PAID':
        return 'paid';

      default:
        return '';
    }
  }

  clearSearch(): void {

    this.searchText = '';
  }

  viewBill(bill: BillManagement): void {

  if (bill.billType === 'MANUAL') {
    this.router.navigate([
      '/admin/bills/manual',
      bill.id
    ]);

    return;
  }

  this.router.navigate([
    '/admin/bills',
    bill.id
  ]);
}

  retry(): void {

    this.loadBills();
  }

}