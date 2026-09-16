import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
export class ShopkeeperDashboardComponent {

}