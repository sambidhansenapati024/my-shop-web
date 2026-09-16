import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService,
  JwtPayload
} from '../../../services/auth.service';

import {
  Order,
  OrderService
} from '../../../services/order.service';

@Component({
  selector: 'app-my-account',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css'
})
export class MyAccountComponent
  implements OnInit {

  customer: JwtPayload | null = null;

  orders: Order[] = [];

  isLoadingOrders = false;

  errorMessage = '';

  customerInitial = 'C';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.loadCustomer();

    this.loadOrders();
  }

  loadCustomer(): void {

    this.customer =
      this.authService.getUserFromToken();

    if (!this.customer) {

      this.router.navigate([
        '/login'
      ]);

      return;
    }

    const name =
      this.customer.name || 'Customer';

    this.customerInitial =
      name
        .trim()
        .charAt(0)
        .toUpperCase() || 'C';
  }

  loadOrders(): void {

    this.isLoadingOrders = true;

    this.errorMessage = '';

    this.orderService
      .getMyOrders()
      .subscribe({

        next: (response) => {

          this.isLoadingOrders = false;

          this.orders =
            response?.data || [];
        },

        error: (error) => {

          this.isLoadingOrders = false;

          console.error(
            'Failed to load orders:',
            error
          );

          this.errorMessage =
            'Unable to load your order information.';
        }

      });
  }

  getTotalOrders(): number {

    return this.orders.length;
  }

  getPendingOrders(): number {

    return this.orders.filter(order => {

      const status =
        order.status?.toUpperCase();

      return (
        status === 'RECEIVED' ||
        status === 'PREPARING' ||
        status === 'PACKING' ||
        status === 'READY'
      );

    }).length;
  }

  getCompletedOrders(): number {

    return this.orders.filter(order => {

      const status =
        order.status?.toUpperCase();

      return status === 'COMPLETED';

    }).length;
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }
}