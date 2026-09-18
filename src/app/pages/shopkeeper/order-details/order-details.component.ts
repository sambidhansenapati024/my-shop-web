
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AdminOrderService,
  CalculateBillRequest,
  BillCalculation,
  PaymentRequest
} from '../../../services/admin-order.service';

import { AdminOrder, Payment } from '../../../models/admin-order';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    FormsModule
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {

  orderId: number | null = null;

  order: AdminOrder | null = null;

  isLoading = false;
  errorMessage = '';

  isUpdatingStatus = false;
  statusMessage = '';

  // ==============================
  // BILL CALCULATION
  // ==============================
  isBillPreview = false;
  isBillGenerated = false;
  isEditingBill = false;

  unitPrices: Record<number, number | null> = {};

  calculationResult: BillCalculation | null = null;

  isCalculating = false;
  calculationMessage = '';

  // ==============================
// PAYMENT
// ==============================
showPaymentSection = false;
paymentAmount: number | null = null;
isFullPayment = false;
isProcessingPayment = false;
paymentMessage = '';

// ==============================
// PAYMENT HISTORY
// ==============================

payments: Payment[] = [];

isLoadingPayments = false;

paymentHistoryMessage = '';

  // ==============================
  // CONSTRUCTOR
  // ==============================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminOrderService: AdminOrderService
  ) {}

  // ==============================
  // INIT
  // ==============================

  ngOnInit(): void {

    const idParam =
      this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.router.navigate(['/admin/orders']);
      return;
    }

    const id = Number(idParam);

    if (Number.isNaN(id)) {
      this.router.navigate(['/admin/orders']);
      return;
    }

    this.orderId = id;

    this.loadOrder();
  }

  // ==============================
  // LOAD ORDER
  // ==============================

  loadOrder(): void {

    if (this.orderId === null) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.adminOrderService
      .getOrderById(this.orderId)
      .subscribe({

        next: (response) => {

          this.isLoading = false;

          this.order = response?.data || null;

          this.unitPrices = {};
          this.calculationResult = null;
          this.isBillPreview = false;
          this.isBillGenerated = false;

if (
  this.order &&
  (
    this.order.status?.toUpperCase() === 'BILLED' ||
    this.order.status?.toUpperCase() === 'BILL_MODIFIED'
  )
) {
  const billedItems = (this.order.items || []).map(item => {

    // Load saved prices into the editable input fields.
    this.unitPrices[item.id] = item.unitPrice ?? null;

    return {
      itemId: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice ?? 0,
      itemTotal: item.itemTotal ?? 0
    };
  });

  this.calculationResult = {
    items: billedItems,
    totalAmount: this.order.totalAmount ?? 0
  };

  this.isBillPreview = true;
  this.isBillGenerated = true;
  this.isEditingBill = false;
  this.loadPaymentHistory();
}

        },

        error: (error) => {

          this.isLoading = false;

          console.error(
            'Failed to load admin order:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load order. Please try again.';

        }

      });
  }

  // ==============================
  // STATUS LABEL
  // ==============================

  getStatusLabel(status: string): string {

    switch (status?.toUpperCase()) {

      case 'RECEIVED':
        return 'New Order';

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

      default:
        return status || 'Unknown';
    }
  }

  // ==============================
  // STATUS CSS CLASS
  // ==============================

  getStatusClass(status: string): string {

    switch (status?.toUpperCase()) {

      case 'RECEIVED':
        return 'received';

      case 'PACKING':
        return 'packing';

      case 'READY':
        return 'ready';

      case 'BILLED':
        return 'billed';

      case 'BILL_MODIFIED':
        return 'billed';

      case 'COMPLETED':
        return 'completed';

      default:
        return '';
    }
  }

  // ==============================
  // ORDER TYPE
  // ==============================

  getOrderTypeLabel(orderType: string): string {

    return orderType?.toUpperCase() === 'PHOTO'
      ? 'Photo Order'
      : 'Manual Order';
  }

  // ==============================
  // UPDATE STATUS
  // ==============================

  updateStatus(
    status:
      | 'RECEIVED'
      | 'PACKING'
      | 'READY'
      | 'BILLED'
      | 'BILL_MODIFIED'
      | 'COMPLETED'
  ): void {

    if (
      this.orderId === null ||
      this.isUpdatingStatus
    ) {
      return;
    }

    this.isUpdatingStatus = true;
    this.statusMessage = '';

    this.adminOrderService
      .updateOrderStatus(
        this.orderId,
        status
      )
      .subscribe({

        next: (response) => {

          this.isUpdatingStatus = false;

          if (response?.data) {
            this.order = response.data;
          }

          this.statusMessage =
            response?.message ||
            'Order status updated successfully.';
        },

        error: (error) => {

          this.isUpdatingStatus = false;

          console.error(
            'Failed to update order status:',
            error
          );

          this.statusMessage =
            error?.error?.message ||
            'Unable to update order status. Please try again.';
        }

      });
  }

  // ==============================
  // NEXT STATUS
  // ==============================

  getNextStatus():
    | 'PACKING'
    | 'READY'
    | 'BILLED'
    | 'COMPLETED'
    | null {

    const status =
      this.order?.status?.toUpperCase();

    switch (status) {

      case 'RECEIVED':
        return 'PACKING';

      case 'PACKING':
        return 'READY';

      case 'READY':
        return 'BILLED';

      case 'BILLED':
        return 'COMPLETED';

      default:
        return null;
    }
  }

  // ==============================
  // UNIT PRICE
  // ==============================

  setUnitPrice(
  itemId: number,
  value: string
): void {

  const price =
    value === ''
      ? null
      : Number(value);

  this.unitPrices[itemId] = price;

  // Clear calculated result when price changes
  this.calculationResult = null;

  this.isBillPreview = false;

  this.calculationMessage = '';

}

  getUnitPrice(itemId: number): number | null {

    return this.unitPrices[itemId] ?? null;
  }

  // ==============================
  // CALCULATE BILL
  // ==============================

  calculateBill(): void {

  if (
    this.orderId === null ||
    !this.order
  ) {
    return;
  }

  const items = this.order.items || [];

  if (items.length === 0) {

    this.calculationMessage =
      'This order has no manual items to calculate.';

    return;
  }

  const requestItems: {
    itemId: number;
    unitPrice: number;
  }[] = [];

  for (const item of items) {

    const unitPrice =
      this.unitPrices[item.id];

    if (
      unitPrice === null ||
      unitPrice === undefined ||
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0
    ) {

      this.calculationMessage =
        `Please enter a valid price for ${item.itemName}.`;

      return;
    }

    requestItems.push({
      itemId: item.id,
      unitPrice
    });

  }

  const request: CalculateBillRequest = {
    items: requestItems
  };

  this.isCalculating = true;
  this.calculationMessage = '';
  this.calculationResult = null;

  this.adminOrderService
    .calculateBill(
      this.orderId,
      request
    )
    .subscribe({

      next: (response) => {

        this.isCalculating = false;

        this.calculationResult =
          response?.data || null;

        this.calculationMessage =
          response?.message ||
          'Bill calculated successfully.';

        // Switch from price entry to bill preview.
        if (this.calculationResult) {
          this.isBillPreview = true;
          this.isEditingBill = false;
          this.isBillGenerated = false;
        }

      },

      error: (error) => {

        this.isCalculating = false;

        console.error(
          'Failed to calculate bill:',
          error
        );

        this.calculationMessage =
          error?.error?.message ||
          'Unable to calculate bill. Please try again.';

      }

    });

}

// ==============================
// EDIT BILL PRICES
// ==============================

editBillPrices(): void {

  // Keep the saved prices in the input fields.
  this.isBillPreview = false;
  this.isBillGenerated = true;
  this.isEditingBill = true;

  this.calculationMessage = '';

}

// ==============================
// PAYMENT
// ==============================

toggleFullPayment(): void {
  if (this.isFullPayment && this.order) {
    this.paymentAmount =
      this.order.remainingAmount ?? this.order.totalAmount ?? 0;
  } else {
    this.paymentAmount = null;
  }
}

makePayment(): void {
  if (
    !this.order ||
    this.paymentAmount === null ||
    this.paymentAmount <= 0 ||
    this.isProcessingPayment
  ) {
    return;
  }

  const request: PaymentRequest = {
  amount: this.paymentAmount,
  paymentMethod: 'CASH'
};

  this.isProcessingPayment = true;
  this.paymentMessage = '';

  this.adminOrderService
    .makePayment(this.order.id, request)
    .subscribe({
      next: (response) => {
        this.isProcessingPayment = false;

        this.paymentMessage =
          response?.message ||
          'Payment completed successfully.';

        this.showPaymentSection = false;
        this.paymentAmount = null;
        this.isFullPayment = false;

        this.loadOrder();
      },

      error: (error) => {
        this.isProcessingPayment = false;

        this.paymentMessage =
          error?.error?.message ||
          'Unable to process payment. Please try again.';
      }
    });
}

  // ==============================
  // RETRY
  // ==============================

  retry(): void {

    this.loadOrder();
  }

  // ==============================
  // BACK
  // ==============================

  goBack(): void {

    this.router.navigate([
      '/admin/orders'
    ]);
  }

  generateBill(): void {

  if (!this.order) {
    return;
  }

  const requestItems: {
    itemId: number;
    unitPrice: number;
  }[] = [];

  for (const item of this.order.items || []) {

    const unitPrice = this.getUnitPrice(item.id);

    if (
      unitPrice === null ||
      unitPrice === undefined ||
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0
    ) {
      this.calculationMessage =
        `Please enter a valid price for ${item.itemName}.`;
      return;
    }

    requestItems.push({
      itemId: item.id,
      unitPrice
    });
  }

  const request: CalculateBillRequest = {
    items: requestItems
  };

  this.isCalculating = true;
  this.calculationMessage = '';

  this.adminOrderService.generateBill(
    this.order.id,
    request
  ).subscribe({

    next: (response) => {

      this.isCalculating = false;
      this.isEditingBill = false;

      this.calculationMessage =
        response?.message ||
        'Bill generated successfully.';

      this.loadOrder();

    },

    error: (error) => {

      this.isCalculating = false;

      this.calculationMessage =
        error?.error?.message ||
        'Failed to generate bill.';

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

        this.isLoadingPayments = false;

        this.payments = response || [];

      },

      error: (error) => {

        this.isLoadingPayments = false;

        console.error(
          'Failed to load payment history:',
          error
        );

        this.paymentHistoryMessage =
          'Unable to load payment history.';

      }

    });

}

}