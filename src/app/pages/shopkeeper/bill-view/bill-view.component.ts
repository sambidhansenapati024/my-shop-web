
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminOrder, Payment } from '../../../models/admin-order';
import { AdminOrderService } from '../../../services/admin-order.service';

@Component({
  selector: 'app-bill-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bill-view.component.html',
  styleUrl: './bill-view.component.css'
})
export class BillViewComponent implements OnInit {

  order: AdminOrder | null = null;
  payments: Payment[] = [];

  orderId: number | null = null;

  isLoading = true;
  isLoadingPayments = false;

  errorMessage = '';
  paymentHistoryMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminOrderService: AdminOrderService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (id) {
        this.orderId = Number(id);
        this.loadBillDetails();
      }

    });
  }

  loadBillDetails(): void {

    if (this.orderId === null) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.adminOrderService.getOrderById(this.orderId).subscribe({

      next: (response) => {

        this.order = response.data;
        this.isLoading = false;

        this.loadPaymentHistory();

      },

      error: (error) => {

        console.error('Failed to load bill details:', error);

        this.errorMessage = 'Unable to load bill details.';
        this.isLoading = false;

      }

    });

  }

  loadPaymentHistory(): void {

    if (this.orderId === null) {
      return;
    }

    this.isLoadingPayments = true;
    this.paymentHistoryMessage = '';

    this.adminOrderService
      .getPaymentsByOrderId(this.orderId)
      .subscribe({

        next: (response) => {

          this.payments = response || [];
          this.isLoadingPayments = false;

        },

        error: (error) => {

          console.error('Failed to load payment history:', error);

          this.paymentHistoryMessage =
            'Unable to load payment history.';

          this.isLoadingPayments = false;

        }

      });

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

  goBack(): void {
    this.router.navigate(['/admin/bills']);
  }

}