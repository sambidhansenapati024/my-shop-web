import {
  Component,
  OnInit
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import { RouterLink } from '@angular/router';

import {
  Order,
  OrderService
} from '../../../services/order.service';

import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-customer-home',

  imports: [
    RouterLink,
    DatePipe
  ],

  templateUrl: './customer-home.component.html',

  styleUrl: './customer-home.component.css'
})
export class CustomerHomeComponent implements OnInit {

  customerName = '';

  orders: Order[] = [];

  isLoadingOrders = false;

  errorMessage = '';


  constructor(
    private authService: AuthService,
    private orderService: OrderService
  ) {}


  ngOnInit(): void {

    const user =
      this.authService.getUserFromToken();

    this.customerName =
      user?.name || 'Customer';

    this.loadOrders();
  }


  loadOrders(): void {

    this.isLoadingOrders = true;

    this.errorMessage = '';


    this.orderService.getMyOrders().subscribe({

      next: (response) => {

        this.isLoadingOrders = false;

        this.orders =
          response?.data || [];

      },


      error: (error) => {

        this.isLoadingOrders = false;

        console.error(
          'Failed to load customer orders:',
          error
        );

        this.errorMessage =
          'Unable to load your orders.';
      }

    });

  }


  getRecentOrders(): Order[] {

    return this.orders.slice(0, 3);

  }


  getTotalOrders(): number {

    return this.orders.length;

  }


  getPendingOrders(): number {

    return this.orders.filter(order =>
      order.status === 'RECEIVED' ||
      order.status === 'PREPARING'
    ).length;

  }

}