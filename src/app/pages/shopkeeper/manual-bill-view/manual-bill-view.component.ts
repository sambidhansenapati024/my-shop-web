import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  ManualBill,
  ManualBillingService,
  ManualBillPayment
} from '../../../services/manual-billing.service';

@Component({
  selector: 'app-manual-bill-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manual-bill-view.component.html',
  styleUrl: './manual-bill-view.component.css'
})
export class ManualBillViewComponent implements OnInit {

  bill: ManualBill | null = null;

  billId: number | null = null;

  isLoading = true;
  errorMessage = '';

  isDownloading = false;
  isPrinting = false;

  payments: ManualBillPayment[] = [];
isLoadingPayments = false;
paymentHistoryMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private manualBillingService: ManualBillingService
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (!id) {
        this.router.navigate(['/admin/bills']);
        return;
      }

      const billId = Number(id);

      if (Number.isNaN(billId)) {
        this.router.navigate(['/admin/bills']);
        return;
      }

      this.billId = billId;

      this.loadBillDetails();

    });

  }

  loadBillDetails(): void {

    if (this.billId === null) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.manualBillingService
      .getBill(this.billId)
      .subscribe({

        next: (bill) => {

          this.bill = bill;
          this.isLoading = false;
          this.loadPaymentHistory();

        },

        error: (error) => {

          console.error(
            'Failed to load manual bill details:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load bill details.';

          this.isLoading = false;

        }

      });

  }

  loadPaymentHistory(): void {
  if (this.billId === null) {
    return;
  }

  this.isLoadingPayments = true;
  this.paymentHistoryMessage = '';

  this.manualBillingService
    .getPaymentHistory(this.billId)
    .subscribe({
      next: (payments) => {
        this.payments = payments;
        this.isLoadingPayments = false;
      },
      error: (error) => {
        console.error(
          'Failed to load payment history:',
          error
        );

        this.paymentHistoryMessage =
          'Unable to load payment history.';

        this.isLoadingPayments = false;
      }
    });
}

  getPaymentStatusLabel(
    status?: string | null
  ): string {

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

  getPaymentStatusClass(
    status?: string | null
  ): string {

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

  downloadBill(): void {

    if (this.billId === null) {
      return;
    }

    this.isDownloading = true;

    this.manualBillingService
      .downloadBillPdf(this.billId)
      .subscribe({

        next: (blob) => {

          const url =
            window.URL.createObjectURL(blob);

          const link =
            document.createElement('a');

          link.href = url;

          link.download =
            `${this.bill?.billNumber || 'manual-bill'}.pdf`;

          link.click();

          window.URL.revokeObjectURL(url);

          this.isDownloading = false;

        },

        error: (error) => {

          console.error(
            'Failed to download manual bill:',
            error
          );

          alert(
            'Unable to download bill PDF.'
          );

          this.isDownloading = false;

        }

      });

  }

  printBill(): void {

    if (this.billId === null) {
      return;
    }

    this.isPrinting = true;

    this.manualBillingService
      .downloadBillPdf(this.billId)
      .subscribe({

        next: (blob) => {

          const url =
            window.URL.createObjectURL(blob);

          const printWindow =
            window.open(url, '_blank');

          if (!printWindow) {

            alert(
              'Please allow pop-ups to print the bill.'
            );

            window.URL.revokeObjectURL(url);

            this.isPrinting = false;

            return;

          }

          printWindow.onload = () => {

            printWindow.focus();

            setTimeout(() => {

              printWindow.print();

              this.isPrinting = false;

            }, 300);

          };

        },

        error: (error) => {

          console.error(
            'Failed to print manual bill:',
            error
          );

          alert(
            'Unable to print bill.'
          );

          this.isPrinting = false;

        }

      });

  }

  goBack(): void {

    this.router.navigate([
      '/admin/bills'
    ]);

  }

}