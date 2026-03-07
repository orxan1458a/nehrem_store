import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'shop', pathMatch: 'full' },
  {
    path: 'shop',
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist.component').then(m => m.WishlistComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/admin/products/admin-products.component')
          .then(m => m.AdminProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/admin/categories/admin-categories.component')
          .then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/admin/orders/admin-orders.component')
          .then(m => m.AdminOrdersComponent)
      },
      {
        path: 'orders/:id/print',
        loadComponent: () => import('./pages/admin/orders/order-print/order-print.component')
          .then(m => m.OrderPrintComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'shop' }
];
