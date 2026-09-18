
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminOrder } from '../../../models/admin-order';
import { AdminOrderService } from '../../../services/admin-order.service';
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

  bills: BillResponse[] = [];

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

    this.adminOrderService.getAllBills().subscribe({

      next: (response) => {

        this.bills = (response.data || [])
          .filter(order => order.billedAt !== null &&
                           order.billedAt !== undefined);

        this.isLoading = false;
      },

      error: (error) => {

        console.error('Failed to load bills:', error);

        this.errorMessage = 'Unable to load bills.';

        this.isLoading = false;
      }

    });
  }

  get filteredBills(): BillResponse[] {

    let result = this.bills;

    if (this.selectedFilter !== 'ALL') {

      result = result.filter(
        bill => bill.paymentStatus === this.selectedFilter
      );

    }

    const search = this.searchText.trim().toLowerCase();

    if (search) {

      result = result.filter(bill =>
        bill.orderNumber.toLowerCase().includes(search) ||
        bill.customerName.toLowerCase().includes(search) ||
        String(bill.id).includes(search)
      );

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

  viewBill(bill: BillResponse): void {
  this.router.navigate(['/admin/bills', bill.id]);
}

  retry(): void {

    this.loadBills();
  }

}