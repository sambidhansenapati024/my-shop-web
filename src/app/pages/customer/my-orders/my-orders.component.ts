import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import {
  Order,
  OrderService
} from '../../../services/order.service';

import {
  AuthService
} from '../../../services/auth.service';


@Component({
  selector: 'app-my-orders',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit {

  orders: Order[] = [];

  isLoading = false;

  errorMessage = '';

  customerName = '';

  customerInitial = 'C';


  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}


  ngOnInit(): void {

    this.loadCustomer();

    this.loadOrders();

  }


  // =====================================================
  // CUSTOMER
  // =====================================================

  loadCustomer(): void {

    const customer =
      this.authService.getUserFromToken();

    if (!customer) {
      return;
    }


    this.customerName =
      customer.name || 'Customer';


    this.customerInitial =
      this.customerName
        .trim()
        .charAt(0)
        .toUpperCase() || 'C';

  }


  // =====================================================
  // LOAD ORDERS
  // =====================================================

  loadOrders(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.orderService
      .getMyOrders()
      .subscribe({

        next: (response) => {

          this.isLoading = false;

          this.orders =
            response?.data || [];

        },


        error: (error) => {

          this.isLoading = false;

          console.error(
            'Failed to load orders:',
            error
          );


          this.errorMessage =
            'Unable to load your orders. Please try again.';

        }

      });

  }


  // =====================================================
  // STATUS LABEL
  // =====================================================

  getStatusLabel(
    status: string
  ): string {

    switch (
      status?.toUpperCase()
    ) {

      case 'RECEIVED':
        return 'Order Received';

      case 'PREPARING':
        return 'Preparing';

      case 'PACKING':
        return 'Packing';

      case 'READY':
        return 'Ready for Pickup';

      case 'BILLED':
        return 'Bill Generated';

      case 'COMPLETED':
        return 'Completed';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status || 'Unknown';

    }

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: string
  ): string {

    switch (
      status?.toUpperCase()
    ) {

      case 'RECEIVED':
        return 'received';

      case 'PREPARING':
      case 'PACKING':
        return 'packing';

      case 'READY':
        return 'ready';

      case 'BILLED':
        return 'billed';

      case 'COMPLETED':
        return 'completed';

      default:
        return '';

    }

  }


  // =====================================================
  // ORDER TYPE
  // =====================================================

  isManualOrder(
    order: Order
  ): boolean {

    return order.orderType?.toUpperCase()
      === 'MANUAL';

  }


  // =====================================================
  // RETRY
  // =====================================================

  retry(): void {

    this.loadOrders();

  }

}