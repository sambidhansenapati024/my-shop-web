import { Component, OnInit, OnDestroy } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import { AdminOrderService } from '../../../services/admin-order.service';

import { AdminOrder } from '../../../models/admin-order';
import {
  Subscription,
  timer
} from 'rxjs';


@Component({
  selector: 'app-shopkeeper-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './shopkeeper-dashboard.component.html',
  styleUrl: './shopkeeper-dashboard.component.css'
})
export class ShopkeeperDashboardComponent
  implements OnInit, OnDestroy  {

    private dashboardSubscription?: Subscription;
  // ==========================================
  // Orders
  // ==========================================

  orders: AdminOrder[] = [];

  loading = true;

  error = false;


  // ==========================================
  // Dashboard statistics
  // ==========================================

  newOrdersCount = 0;

  preparingCount = 0;

  readyCount = 0;

  completedCount = 0;


  // ==========================================
  // Today's activity
  // ==========================================

  todayOrdersCount = 0;

  todayReadyCount = 0;

  todayPayments = 0;


  constructor(
    private adminOrderService: AdminOrderService
  ) {}


  // ==========================================
  // Initialization
  // ==========================================

  ngOnInit(): void {

  this.loadDashboard();

  this.dashboardSubscription =
    timer(30000, 30000)
      .subscribe(() => {

        this.loadDashboard();

      });

}


  // ==========================================
  // Load orders
  // ==========================================

  loadDashboard(): void {

    this.loading = true;

    this.error = false;

    this.adminOrderService
      .getAllOrders()
      .subscribe({

        next: (response) => {

          this.orders = response.data || [];

          this.calculateStatistics();

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Failed to load dashboard orders:',
            error
          );

          this.loading = false;

          this.error = true;

        }

      });

  }


  // ==========================================
  // Calculate dashboard statistics
  // ==========================================

  calculateStatistics(): void {

    // ------------------------------------------
    // New Orders
    // ------------------------------------------

    this.newOrdersCount =
      this.orders.filter(
        order => order.status === 'RECEIVED'
      ).length;


    // ------------------------------------------
    // Preparing
    // ------------------------------------------

    this.preparingCount =
      this.orders.filter(
        order => order.status === 'PACKING'
      ).length;


    // ------------------------------------------
    // Ready
    // ------------------------------------------

    this.readyCount =
      this.orders.filter(
        order => order.status === 'READY'
      ).length;


    // ------------------------------------------
    // Completed
    // ------------------------------------------

    this.completedCount =
      this.orders.filter(
        order => order.status === 'COMPLETED'
      ).length;


    // ------------------------------------------
    // Today's orders
    // ------------------------------------------

    const today =
      new Date()
        .toISOString()
        .split('T')[0];


    const todayOrders =
      this.orders.filter(order => {

        return order.createdAt
          ?.startsWith(today);

      });


    this.todayOrdersCount =
      todayOrders.length;


    // ------------------------------------------
    // Today's ready orders
    // ------------------------------------------

    this.todayReadyCount =
      todayOrders.filter(
        order => order.status === 'READY'
      ).length;


    // ------------------------------------------
    // Today's payments
    // ------------------------------------------

    this.todayPayments =
      todayOrders.reduce(
        (total, order) => {

          return total +
            (order.paidAmount || 0);

        },
        0
      );

  }

  getOrderStatusLabel(status: string): string {

  switch (status) {

    case 'RECEIVED':
      return 'New Order';

    case 'PACKING':
      return 'Preparing';

    case 'READY':
      return 'Ready';

    case 'BILLED':
      return 'Billed';

    case 'BILL_MODIFIED':
      return 'Bill Modified';

    case 'COMPLETED':
      return 'Completed';

    default:
      return status;

  }

}

ngOnDestroy(): void {

  this.dashboardSubscription?.unsubscribe();

}

}