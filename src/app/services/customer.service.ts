import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private currentCustomer: Customer = {
    id: 1,
    name: 'Ramesh',
    mobileNumber: '9876543210',
    email: null
  };

  getCurrentCustomer(): Customer {
    return this.currentCustomer;
  }
}