import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { OrderResponse } from '../../core/models/order.model';

@Component({
  selector: 'app-courier-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courier-orders.component.html',
  styleUrl: './courier-orders.component.scss'
})
export class CourierOrdersComponent implements OnInit {
  private auth     = inject(AuthService);
  private orderSvc = inject(OrderService);
  private router   = inject(Router);

  orders        = signal<OrderResponse[]>([]);
  loading       = signal(true);
  totalPages    = signal(0);
  currentPage   = signal(0);
  actionLoading = signal<number | null>(null);

  /** Per-order fail reason text (populated by the inline input before submitting). */
  failReasons = new Map<number, string>();

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

  /** ACCEPTED → OUT_FOR_DELIVERY */
  startDelivery(order: OrderResponse): void {
    this.actionLoading.set(order.id);
    this.orderSvc.markOutForDelivery(order.id).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null)
    });
  }

  /** OUT_FOR_DELIVERY → DELIVERED */
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

  /** OUT_FOR_DELIVERY → FAIL_ATTEMPT (reason required) */
  markFailAttempt(order: OrderResponse): void {
    const reason = (this.failReasons.get(order.id) ?? '').trim();
    if (!reason) return;
    this.actionLoading.set(order.id);
    this.orderSvc.markFailAttempt(order.id, reason).subscribe({
      next: () => {
        this.orders.update(list => list.filter(o => o.id !== order.id));
        this.failReasons.delete(order.id);
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null)
    });
  }

  getFailReason(orderId: number): string {
    return this.failReasons.get(orderId) ?? '';
  }

  setFailReason(orderId: number, value: string): void {
    this.failReasons.set(orderId, value);
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
