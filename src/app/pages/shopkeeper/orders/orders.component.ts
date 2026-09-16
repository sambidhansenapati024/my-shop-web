import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ShopkeeperOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  orderType: 'MANUAL' | 'PHOTO';
  itemCount: number;
  status:
    | 'RECEIVED'
    | 'PREPARING'
    | 'READY'
    | 'BILLED'
    | 'COMPLETED'
    | 'CANCELLED';
  createdAt: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {

  selectedFilter:
    | 'ALL'
    | 'RECEIVED'
    | 'PREPARING'
    | 'READY'
    | 'BILLED'
    | 'COMPLETED' = 'ALL';

  searchText = '';

  /*
   * Temporary frontend data.
   *
   * This will be removed when we connect
   * the Spring Boot admin API.
   */
  orders: ShopkeeperOrder[] = [];


  setFilter(
    filter:
      | 'ALL'
      | 'RECEIVED'
      | 'PREPARING'
      | 'READY'
      | 'BILLED'
      | 'COMPLETED'
  ): void {
    this.selectedFilter = filter;
  }


  get filteredOrders(): ShopkeeperOrder[] {

    let result = this.orders;

    if (this.selectedFilter !== 'ALL') {
      result = result.filter(
        order => order.status === this.selectedFilter
      );
    }

    const search =
      this.searchText.trim().toLowerCase();

    if (search) {
      result = result.filter(order =>
        order.orderNumber
          .toLowerCase()
          .includes(search) ||

        order.customerName
          .toLowerCase()
          .includes(search)
      );
    }

    return result;
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


  getOrderTypeLabel(
    orderType: string
  ): string {

    return orderType?.toUpperCase() === 'PHOTO'
      ? 'Photo Order'
      : 'Manual Order';
  }


  clearSearch(): void {
    this.searchText = '';
  }

}