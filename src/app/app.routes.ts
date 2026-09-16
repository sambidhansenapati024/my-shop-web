import { Routes } from '@angular/router';

// ================================
// Authentication
// ================================
import { RegisterComponent } from './pages/auth/register/register.component';

// ================================
// Guards
// ================================
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// ================================
// Customer
// ================================
import { OrderReviewComponent } from './pages/customer/order-review/order-review.component';
import { OrderDetailsComponent } from './pages/customer/order-details/order-details.component';

// ================================
// Layouts
// ================================
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

// ================================
// Shopkeeper
// ================================
import { ShopkeeperDashboardComponent } from './pages/shopkeeper/shopkeeper-dashboard/shopkeeper-dashboard.component';
import { OrdersComponent } from './pages/shopkeeper/orders/orders.component';

import {
  OrderDetailsComponent as ShopkeeperOrderDetailsComponent
} from './pages/shopkeeper/order-details/order-details.component';
import { CustomersComponent } from './pages/shopkeeper/customers/customers.component';


export const routes: Routes = [

  // =========================================================
  // DEFAULT
  // =========================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // =========================================================
  // PUBLIC / AUTHENTICATION
  // =========================================================

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'register',
    component: RegisterComponent
  },


  // =========================================================
  // CUSTOMER / MAIN LAYOUT
  // =========================================================

  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],

    children: [

      // /app
      // Redirect to /app/home
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },


      // /app/home
      {
        path: 'home',
        loadComponent: () =>
          import(
            './pages/customer/customer-home/customer-home.component'
          )
            .then(m => m.CustomerHomeComponent)
      },


      // /app/create-order
      {
        path: 'create-order',
        loadComponent: () =>
          import(
            './pages/customer/create-order/create-order.component'
          )
            .then(m => m.CreateOrderComponent)
      },


      // /app/order-review
      {
        path: 'order-review',
        component: OrderReviewComponent
      },


      // /app/orders
      {
        path: 'orders',
        loadComponent: () =>
          import(
            './pages/customer/my-orders/my-orders.component'
          )
            .then(m => m.MyOrdersComponent)
      },


      // /app/orders/:id
      {
        path: 'orders/:id',
        component: OrderDetailsComponent
      },


      // /app/account
      {
        path: 'account',
        loadComponent: () =>
          import(
            './pages/customer/my-account/my-account.component'
          )
            .then(m => m.MyAccountComponent)
      }

    ]
  },


  // =========================================================
  // ADMIN / SHOPKEEPER LAYOUT
  // =========================================================

  {
    path: 'admin',
    component: AdminLayoutComponent,
    //canActivate: [adminGuard],

    children: [

      // /admin
      // Redirect to /admin/dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },


      // /admin/dashboard
      {
        path: 'dashboard',
        component: ShopkeeperDashboardComponent
      },


      // /admin/orders
      {
        path: 'orders',
        component: OrdersComponent
      },


      // /admin/orders/:id
      {
        path: 'orders/:id',
        component: ShopkeeperOrderDetailsComponent
      },
       {
        path: 'customers',
        component: CustomersComponent
      }

    ]
  },


  // =========================================================
  // UNKNOWN ROUTE
  // =========================================================

  {
    path: '**',
    redirectTo: 'login'
  }

];