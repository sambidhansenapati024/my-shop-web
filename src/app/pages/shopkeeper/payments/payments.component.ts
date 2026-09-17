import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Payment {
  id: number;
  paymentNumber: string;
  billNumber: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'OTHER';
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED';
  paymentDate: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent {

  selectedFilter:
    | 'ALL'
    | 'SUCCESS'
    | 'PENDING'
    | 'FAILED' = 'ALL';

  searchText = '';

  payments: Payment[] = [];

  isLoading = false;

  errorMessage = '';


  setFilter(
    filter:
      | 'ALL'
      | 'SUCCESS'
      | 'PENDING'
      | 'FAILED'
  ): void {

    this.selectedFilter = filter;
  }


  get filteredPayments(): Payment[] {

    let result = this.payments;

    if (this.selectedFilter !== 'ALL') {

      result = result.filter(
        payment =>
          payment.paymentStatus === this.selectedFilter
      );
    }

    const search =
      this.searchText.trim().toLowerCase();

    if (search) {

      result = result.filter(payment =>
        payment.paymentNumber
          .toLowerCase()
          .includes(search) ||

        payment.billNumber
          .toLowerCase()
          .includes(search) ||

        payment.orderNumber
          .toLowerCase()
          .includes(search) ||

        payment.customerName
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

      case 'SUCCESS':
        return 'Successful';

      case 'PENDING':
        return 'Pending';

      case 'FAILED':
        return 'Failed';

      default:
        return status || 'Unknown';
    }
  }


  getPaymentStatusClass(
    status: string
  ): string {

    switch (status?.toUpperCase()) {

      case 'SUCCESS':
        return 'success';

      case 'PENDING':
        return 'pending';

      case 'FAILED':
        return 'failed';

      default:
        return '';
    }
  }


  getPaymentMethodLabel(
    method: string
  ): string {

    switch (method?.toUpperCase()) {

      case 'CASH':
        return 'Cash';

      case 'UPI':
        return 'UPI';

      case 'CARD':
        return 'Card';

      case 'OTHER':
        return 'Other';

      default:
        return method || 'Unknown';
    }
  }


  clearSearch(): void {

    this.searchText = '';
  }


  viewPayment(payment: Payment): void {

    /*
     * Payment details will be
     * connected to the backend later.
     */

    console.log(
      'View payment:',
      payment.id
    );
  }


  retry(): void {

    /*
     * Backend payment API will
     * be connected later.
     */

    this.errorMessage = '';
  }

}