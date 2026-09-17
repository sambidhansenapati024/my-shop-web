import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminOrderService } from '../../../services/admin-order.service';
import { AdminOrder } from '../../../models/admin-order';

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
export class OrdersComponent implements OnInit {

  selectedFilter:
    | 'ALL'
    | 'RECEIVED'
    | 'PREPARING'
    | 'READY'
    | 'BILLED'
    | 'COMPLETED' = 'ALL';

  searchText = '';

  orders: AdminOrder[] = [];

  isLoading = false;

  errorMessage = '';


  constructor(
    private adminOrderService: AdminOrderService
  ) {}


  ngOnInit(): void {
    this.loadOrders();
  }


  // ==========================================
  // LOAD ALL ORDERS
  // ==========================================

  loadOrders(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.adminOrderService.getAllOrders().subscribe({

      next: (response) => {

        this.isLoading = false;

        this.orders = response?.data || [];

      },

      error: (error) => {

        this.isLoading = false;

        console.error(
          'Failed to load shopkeeper orders:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to load orders. Please try again.';

      }

    });

  }


  // ==========================================
  // FILTER
  // ==========================================

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


  // ==========================================
  // FILTERED ORDERS
  // ==========================================

  get filteredOrders(): AdminOrder[] {

    let result = this.orders;


    if (this.selectedFilter !== 'ALL') {

      result = result.filter(
        order =>
          order.status?.toUpperCase() ===
          this.selectedFilter
      );

    }


    const search =
      this.searchText.trim().toLowerCase();


    if (search) {

      result = result.filter(order =>

        order.orderNumber
          ?.toLowerCase()
          .includes(search)

      );

    }


    return result;

  }


  // ==========================================
  // STATUS LABEL
  // ==========================================

  getStatusLabel(status: string): string {

    switch (status?.toUpperCase()) {

      case 'RECEIVED':
        return 'New Order';

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


  // ==========================================
  // STATUS CSS CLASS
  // ==========================================

  getStatusClass(status: string): string {

    switch (status?.toUpperCase()) {

      case 'RECEIVED':
        return 'received';

      case 'PREPARING':
        return 'preparing';

      case 'PACKING':
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


  // ==========================================
  // ORDER TYPE
  // ==========================================

  getOrderTypeLabel(
    orderType: string
  ): string {

    return orderType?.toUpperCase() === 'PHOTO'
      ? 'Photo Order'
      : 'Manual Order';

  }


  // ==========================================
  // SEARCH
  // ==========================================

  clearSearch(): void {

    this.searchText = '';

  }


  // ==========================================
  // RETRY
  // ==========================================

  retry(): void {

    this.loadOrders();

  }

}