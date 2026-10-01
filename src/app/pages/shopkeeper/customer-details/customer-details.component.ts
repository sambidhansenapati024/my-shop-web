import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';
import { CustomerDetails, CustomerService } from '../../../services/customer.service';


@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent
  implements OnInit {

  customerId!: number;

  customer: CustomerDetails | null = null;

  isLoading = false;

  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.errorMessage =
        'Customer ID is missing.';

      return;
    }

    this.customerId =
      Number(id);

    this.loadCustomer();
  }

  loadCustomer(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.customerService
      .getCustomerDetails(this.customerId)
      .subscribe({

        next: (response) => {

          this.customer =
            response.data;

          this.isLoading = false;
        },

        error: (error) => {

          console.error(
            'Failed to load customer details:',
            error
          );

          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load customer details.';
        }

      });
  }

  getStatusLabel(status: string): string {

    switch (status?.toUpperCase()) {

      case 'RECEIVED':
        return 'New Order';

      case 'PACKING':
        return 'Preparing';

      case 'READY':
        return 'Ready for Pickup';

      case 'BILLED':
        return 'Billed';

      case 'BILL_MODIFIED':
        return 'Bill Modified';

      case 'COMPLETED':
        return 'Completed';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status || 'Unknown';
    }
  }

  getStatusClass(status: string): string {

    switch (status?.toUpperCase()) {

      case 'RECEIVED':
        return 'received';

      case 'PACKING':
        return 'preparing';

      case 'READY':
        return 'ready';

      case 'BILLED':
        return 'billed';

      case 'BILL_MODIFIED':
        return 'modified';

      case 'COMPLETED':
        return 'completed';

      case 'CANCELLED':
        return 'cancelled';

      default:
        return '';
    }
  }

  getPaymentStatusLabel(
    status: string
  ): string {

    switch (status?.toUpperCase()) {

      case 'PAID':
        return 'Paid';

      case 'PARTIAL':
        return 'Partially Paid';

      case 'UNPAID':
        return 'Unpaid';

      default:
        return status || 'Unknown';
    }
  }

  retry(): void {
    this.loadCustomer();
  }
}