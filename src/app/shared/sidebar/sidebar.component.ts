import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { AuthService, JwtPayload } from '../../services/auth.service';


interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent
  implements OnInit {

  user: JwtPayload | null = null;

  isAdmin = false;

  isOpen = false;

  menuItems: SidebarMenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.loadUser();

  }

  loadUser(): void {

    this.user =
      this.authService.getUserFromToken();

    if (!this.user) {
      return;
    }

    this.isAdmin =
      this.user.role === 'ADMIN';

    this.setMenuItems();
  }

  setMenuItems(): void {

    if (this.isAdmin) {

      this.menuItems = [

        {
          label: 'Dashboard',
          icon: '📊',
          route: '/admin/dashboard'
        },

        {
          label: 'Orders',
          icon: '📦',
          route: '/admin/orders'
        },

        {
          label: 'Customers',
          icon: '👥',
          route: '/admin/customers'
        },

        {
          label: 'Bills',
          icon: '📄',
          route: '/admin/bills'
        },

        {
          label: 'Payments',
          icon: '💰',
          route: '/admin/payments'
        }

      ];

    } else {

      this.menuItems = [

        {
          label: 'Home',
          icon: '🏠',
          route: '/app/home'
        },

        {
          label: 'New Order',
          icon: '🛒',
          route: '/app/create-order'
        },

        {
          label: 'My Orders',
          icon: '📦',
          route: '/app/orders'
        },

        {
          label: 'My Account',
          icon: '👤',
          route: '/app/account'
        }

      ];

    }
  }

  closeSidebar(): void {

    this.isOpen = false;

  }

  navigate(item: SidebarMenuItem): void {

    this.router.navigate([
      item.route
    ]);

    this.closeSidebar();

  }

  logout(): void {

    this.authService.logout();

    this.closeSidebar();

    this.router.navigate([
      '/login'
    ]);
  }
}