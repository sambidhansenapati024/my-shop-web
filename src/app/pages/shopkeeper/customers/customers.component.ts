import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Customer {
  id: number;
  name: string;
  mobileNumber: string;
  email: string;
  totalOrders: number;
  outstandingAmount: number;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent {

  searchText = '';

  customers: Customer[] = [];

  isLoading = false;

  errorMessage = '';


  constructor(
    private router: Router
  ) {}


  get filteredCustomers(): Customer[] {

    const search =
      this.searchText.trim().toLowerCase();

    if (!search) {
      return this.customers;
    }

    return this.customers.filter(customer =>
      customer.name.toLowerCase().includes(search) ||
      customer.mobileNumber.includes(search) ||
      customer.email.toLowerCase().includes(search)
    );
  }


  clearSearch(): void {
    this.searchText = '';
  }


  openCustomer(customer: Customer): void {

    /*
     * Customer details page will be added later.
     */

    console.log(
      'Open customer:',
      customer.id
    );
  }


  retry(): void {

    /*
     * Backend customer API will be connected later.
     */

    this.errorMessage = '';

  }

}