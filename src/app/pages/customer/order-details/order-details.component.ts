import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  OrderService,
  Order
} from '../../../services/order.service';

import {
  AuthService
} from '../../../services/auth.service';


@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {

  order: Order | null = null;

  isLoading = false;

  errorMessage = '';

  customerName = '';

  customerInitial = 'C';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService
  ) {}


  ngOnInit(): void {

    this.loadCustomer();

    this.loadOrder();

  }


  // =====================================================
  // CUSTOMER
  // =====================================================

  loadCustomer(): void {

    const customer =
      this.authService.getUserFromToken();


    if (customer) {

      this.customerName =
        customer.name || 'Customer';


      this.customerInitial =
        this.customerName
          .trim()
          .charAt(0)
          .toUpperCase() || 'C';

    }

  }


  // =====================================================
  // LOAD ORDER
  // =====================================================

  loadOrder(): void {

    const idParam =
      this.route.snapshot.paramMap.get('id');


    const orderId =
      Number(idParam);


    if (!idParam || Number.isNaN(orderId)) {

      this.router.navigate([
        '/app/orders'
      ]);

      return;

    }


    this.isLoading = true;

    this.errorMessage = '';

    this.order = null;


    this.orderService
      .getOrderById(orderId)
      .subscribe({

        next: (response) => {

          console.log(
            'Order API response:',
            response
          );


          this.isLoading = false;


          this.order =
            response.data;


          console.log(
            'Order loaded:',
            this.order
          );


          console.log(
            'Order items:',
            this.order?.items
          );

        },


        error: (error) => {

          this.isLoading = false;


          console.error(
            'Failed to load order:',
            error
          );


          if (error?.status === 404) {

            this.errorMessage =
              'Order not found.';

          } else {

            this.errorMessage =
              'Unable to load this order. Please try again.';

          }

        }

      });

  }


  // =====================================================
  // ORDER TYPE
  // =====================================================

  isManualOrder(): boolean {

    return (
      this.order?.orderType?.toUpperCase() === 'MANUAL'
    );

  }


  isPhotoOrder(): boolean {

    return (
      this.order?.orderType?.toUpperCase() === 'PHOTO'
    );

  }


  // =====================================================
  // STATUS
  // =====================================================

  getStatusLabel(): string {

    if (!this.order) {
      return '';
    }


    switch (
      this.order.status?.toUpperCase()
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
        return this.order.status || 'Unknown';

    }

  }


  // =====================================================
  // STATUS PROGRESS
  // =====================================================

  isStatusAtLeast(
    requiredStatus: string
  ): boolean {

    if (!this.order) {
      return false;
    }


    const status =
      this.order.status?.toUpperCase();


    const statusOrder: string[] = [
      'RECEIVED',
      'PREPARING',
      'PACKING',
      'READY',
      'BILLED',
      'COMPLETED'
    ];


    const currentIndex =
      statusOrder.indexOf(status);


    const requiredIndex =
      statusOrder.indexOf(
        requiredStatus.toUpperCase()
      );


    if (
      currentIndex === -1 ||
      requiredIndex === -1
    ) {

      return false;

    }


    return currentIndex >= requiredIndex;

  }


  // =====================================================
  // PHOTO
  // =====================================================

  hasPhoto(): boolean {

    return !!this.order?.photoUrl;

  }

}