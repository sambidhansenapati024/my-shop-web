import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  OrderDraftService,
  OrderDraft
} from '../../../services/order-draft.service';

import {
  AuthService,
  JwtPayload
} from '../../../services/auth.service';

import {
  OrderService
} from '../../../services/order.service';


@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './order-review.component.html',
  styleUrl: './order-review.component.css'
})
export class OrderReviewComponent implements OnInit {

  draft!: OrderDraft;

  customer: JwtPayload | null = null;

  isPlacingOrder = false;

  errorMessage = '';


  constructor(
    private orderDraftService: OrderDraftService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.draft =
      this.orderDraftService.getDraft();

    this.customer =
      this.authService.getUserFromToken();


    if (!this.draft) {

      this.router.navigate([
        '/app/create-order'
      ]);

      return;
    }

  }


  editOrder(): void {

    if (this.isPlacingOrder) {
      return;
    }

    this.router.navigate([
      '/app/create-order'
    ]);

  }


  placeOrder(): void {

    if (this.isPlacingOrder) {
      return;
    }


    this.errorMessage = '';


    // ----------------------------------
    // Basic validation
    // ----------------------------------

    if (this.draft.orderType === 'manual') {

      if (
        !this.draft.items ||
        this.draft.items.length === 0
      ) {

        this.errorMessage =
          'Please add at least one item before placing the order.';

        return;
      }

    }


    if (this.draft.orderType === 'photo') {

      if (!this.draft.photo) {

        this.errorMessage =
          'Please upload a grocery list photo before placing the order.';

        return;
      }

    }


    // ----------------------------------
    // Start loading
    // ----------------------------------

    this.isPlacingOrder = true;


    // ----------------------------------
    // Send order to backend
    // ----------------------------------

    this.orderService
      .createOrder(this.draft)
      .subscribe({

        next: (response) => {

          console.log(
            'Order created successfully:',
            response
          );


          this.isPlacingOrder = false;


          // Clear the temporary order draft
          this.orderDraftService.clearDraft();


          // Navigate to the newly created order
          if (response?.data?.id) {

            this.router.navigate([
              '/app/orders',
              response.data.id
            ]);

          } else {

            this.router.navigate([
              '/app/orders'
            ]);

          }

        },


        error: (error) => {

          console.error(
            'Failed to place order:',
            error
          );


          this.isPlacingOrder = false;


          if (
            error?.error?.message
          ) {

            this.errorMessage =
              error.error.message;

          } else {

            this.errorMessage =
              'Unable to place your order. Please try again.';

          }

        }

      });

  }

}