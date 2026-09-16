import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ShopkeeperOrderItem {
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number | null;
  totalPrice: number | null;
}

interface ShopkeeperOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  orderType: 'MANUAL' | 'PHOTO';
  status:
    | 'RECEIVED'
    | 'PREPARING'
    | 'READY'
    | 'BILLED'
    | 'COMPLETED'
    | 'CANCELLED';
  createdAt: string;
  photoUrl: string | null;
  photoNote: string | null;
  items: ShopkeeperOrderItem[];
}

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {

  orderId: number | null = null;

  order: ShopkeeperOrder | null = null;

  isLoading = false;

  errorMessage = '';

  isPacking = false;

  isBillGenerated = false;

  paidAmount = 0;


  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}


  ngOnInit(): void {

    const idParam =
      this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.router.navigate(['/admin/orders']);
      return;
    }

    this.orderId = Number(idParam);

    if (Number.isNaN(this.orderId)) {
      this.router.navigate(['/admin/orders']);
      return;
    }

    this.order = {
  id: this.orderId,
  orderNumber: 'ORD-20260916-001',
  customerName: 'Rahul Kumar',
  customerMobile: '9876543210',
  customerEmail: 'rahul@gmail.com',
  orderType: 'MANUAL',
  status: 'RECEIVED',
  createdAt: new Date().toISOString(),
  photoUrl: null,
  photoNote: null,
  items: [
    {
      itemName: 'Rice',
      quantity: 2,
      unit: 'kg',
      unitPrice: 100,
      totalPrice: 200
    },
    {
      itemName: 'Sugar',
      quantity: 500,
      unit: 'gm',
      unitPrice: 45,
      totalPrice: 22.5
    },
    {
      itemName: 'Parle-G',
      quantity: 2,
      unit: 'packet',
      unitPrice: 10,
      totalPrice: 20
    }
  ]
};

  }


  getStatusLabel(status: string): string {

    switch (status?.toUpperCase()) {

      case 'RECEIVED':
        return 'New Order';

      case 'PREPARING':
        return 'Preparing';

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


  getStatusClass(status: string): string {

    switch (status?.toUpperCase()) {

      case 'RECEIVED':
        return 'received';

      case 'PREPARING':
        return 'preparing';

      case 'READY':
        return 'ready';

      case 'BILLED':
        return 'billed';

      case 'COMPLETED':
        return 'completed';

      case 'CANCELLED':
        return 'cancelled';

      default:
        return '';
    }
  }


  getOrderTypeLabel(orderType: string): string {

    return orderType?.toUpperCase() === 'PHOTO'
      ? 'Photo Order'
      : 'Manual Order';
  }


  getItemTotal(item: ShopkeeperOrderItem): number {

    if (
      item.unitPrice === null ||
      item.quantity === null
    ) {
      return 0;
    }

    return item.unitPrice * item.quantity;
  }


  getBillTotal(): number {

    if (!this.order?.items) {
      return 0;
    }

    return this.order.items.reduce(
      (total, item) => {
        return total + this.getItemTotal(item);
      },
      0
    );
  }


  getRemainingAmount(): number {

    return Math.max(
      this.getBillTotal() - this.paidAmount,
      0
    );
  }


  markAsPreparing(): void {

    this.isPacking = true;
  }


  markAsReady(): void {

    this.isPacking = false;
  }


  generateBill(): void {

    this.isBillGenerated = true;
  }


  setPaymentAmount(amount: number): void {

    if (!amount || amount < 0) {
      this.paidAmount = 0;
      return;
    }

    const total = this.getBillTotal();

    this.paidAmount = Math.min(
      amount,
      total
    );
  }


  getPaymentStatus(): string {

    const total = this.getBillTotal();

    if (total <= 0) {
      return 'Unpaid';
    }

    if (this.paidAmount <= 0) {
      return 'Unpaid';
    }

    if (this.paidAmount >= total) {
      return 'Paid';
    }

    return 'Partially Paid';
  }


  goBack(): void {

    this.router.navigate([
      '/admin/orders'
    ]);
  }

}