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

  isBillViewerOpen = false;
isDownloadingBill = false;


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

  openBillViewer(): void {
  this.isBillViewerOpen = true;
}

closeBillViewer(): void {
  this.isBillViewerOpen = false;
}

downloadBill(): void {

  if (!this.order?.id) {
    return;
  }

  this.isDownloadingBill = true;

  this.orderService
    .downloadBillPdf(this.order.id)
    .subscribe({

      next: (blob) => {

        const url =
          window.URL.createObjectURL(blob);

        const link =
          document.createElement('a');

        link.href = url;

        link.download =
          `bill-${this.order?.orderNumber || this.order?.id}.pdf`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        this.isDownloadingBill = false;
      },

      error: (error) => {

        console.error(
          'Failed to download bill:',
          error
        );

        this.isDownloadingBill = false;

        alert(
          'Unable to download the bill. Please try again.'
        );
      }

    });
}

  verifyBill(): void {

  if (!this.order?.verificationCode) {
    return;
  }

  this.router.navigate([
    '/verify',
    this.order.verificationCode
  ]);
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
      
      case 'BILL_MODIFIED':
        return 'Bill Modified';  

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

  let currentStatus =
    this.order.status?.toUpperCase();

  const required =
    requiredStatus.toUpperCase();

  // BILL_MODIFIED is still part of the billed stage.
  if (currentStatus === 'BILL_MODIFIED') {
    currentStatus = 'BILLED';
  }

  const statusOrder: string[] = [
    'RECEIVED',
    'PREPARING',
    'PACKING',
    'READY',
    'BILLED',
    'COMPLETED'
  ];

  const currentIndex =
    statusOrder.indexOf(currentStatus);

  const requiredIndex =
    statusOrder.indexOf(required);

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

  // =====================================================
// BILL
// =====================================================

isBillGenerated(): boolean {

  const status = this.order?.status?.toUpperCase();

  return (
    status === 'BILLED' ||
    status === 'BILL_MODIFIED'
  );

}


isBillModified(): boolean {

  return (
    this.order?.status?.toUpperCase() === 'BILL_MODIFIED'
  );

}

}