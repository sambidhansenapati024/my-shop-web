import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ShopkeeperBill {
  id: number;
  billNumber: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  createdAt: string;
}

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
export class BillsComponent {

  selectedFilter:
    | 'ALL'
    | 'UNPAID'
    | 'PARTIALLY_PAID'
    | 'PAID' = 'ALL';

  searchText = '';

  bills: ShopkeeperBill[] = [];

  isLoading = false;

  errorMessage = '';


  setFilter(
    filter:
      | 'ALL'
      | 'UNPAID'
      | 'PARTIALLY_PAID'
      | 'PAID'
  ): void {

    this.selectedFilter = filter;
  }


  get filteredBills(): ShopkeeperBill[] {

    let result = this.bills;

    if (this.selectedFilter !== 'ALL') {

      result = result.filter(
        bill =>
          bill.paymentStatus === this.selectedFilter
      );
    }

    const search =
      this.searchText.trim().toLowerCase();

    if (search) {

      result = result.filter(bill =>
        bill.billNumber
          .toLowerCase()
          .includes(search) ||

        bill.orderNumber
          .toLowerCase()
          .includes(search) ||

        bill.customerName
          .toLowerCase()
          .includes(search)
      );
    }

    return result;
  }


  getPaymentStatusLabel(
    status: string
  ): string {

    switch (status?.toUpperCase()) {

      case 'UNPAID':
        return 'Unpaid';

      case 'PARTIALLY_PAID':
        return 'Partially Paid';

      case 'PAID':
        return 'Paid';

      default:
        return status || 'Unknown';
    }
  }


  getPaymentStatusClass(
    status: string
  ): string {

    switch (status?.toUpperCase()) {

      case 'UNPAID':
        return 'unpaid';

      case 'PARTIALLY_PAID':
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


  viewBill(bill: ShopkeeperBill): void {

    /*
     * Bill details / PDF page
     * will be connected later.
     */

    console.log(
      'View bill:',
      bill.id
    );
  }


  retry(): void {

    /*
     * Backend billing API
     * will be connected later.
     */

    this.errorMessage = '';
  }

}