import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { OrderResponse } from '../../core/models/order.model';

@Component({
  selector: 'app-courier-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courier-orders.component.html',
  styleUrl: './courier-orders.component.scss'
})
export class CourierOrdersComponent implements OnInit {
  private auth     = inject(AuthService);
  private orderSvc = inject(OrderService);
  private router   = inject(Router);

  orders       = signal<OrderResponse[]>([]);
  loading      = signal(true);
  totalPages   = signal(0);
  currentPage  = signal(0);
  actionLoading = signal<number | null>(null);

  readonly courierName = this.auth.courierName;

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true);
    this.orderSvc.getCourierOrders(this.currentPage(), 20).subscribe({
      next: (page: any) => {
        this.orders.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  markDelivered(order: OrderResponse): void {
    this.actionLoading.set(order.id);
    this.orderSvc.markDelivered(order.id).subscribe({
      next: () => {
        this.orders.update(list => list.filter(o => o.id !== order.id));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null)
    });
  }

  goToPage(p: number): void {
    this.currentPage.set(p);
    this.loadOrders();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
