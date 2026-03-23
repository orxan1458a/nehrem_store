import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { OrderResponse } from '../../core/models/order.model';

type CourierAction = 'start' | 'deliver' | 'fail';

interface PendingConfirm {
  message: string;
  order: OrderResponse;
  action: CourierAction;
}

@Component({
  selector: 'app-courier-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courier-orders.component.html',
  styleUrl: './courier-orders.component.scss'
})
export class CourierOrdersComponent implements OnInit {
  private orderSvc = inject(OrderService);

  orders         = signal<OrderResponse[]>([]);
  loading        = signal(true);
  totalPages     = signal(0);
  currentPage    = signal(0);
  actionLoading  = signal<number | null>(null);
  pendingConfirm = signal<PendingConfirm | null>(null);

  /** Per-order fail reason text (populated by the inline input before submitting). */
  failReasons = new Map<number, string>();

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

  // ── Confirmation popup ────────────────────────────────────────────────────

  private readonly confirmMessages: Record<CourierAction, string> = {
    start:   'Çatdırılmağa başlamaq istədiyinizə əminsiniz?',
    deliver: 'Sifarişi çatdırılmış kimi qeyd etmək istədiyinizə əminsiniz?',
    fail:    'Uğursuz çatdırılma cəhdini qeyd etmək istədiyinizə əminsiniz?',
  };

  askConfirm(order: OrderResponse, action: CourierAction): void {
    this.pendingConfirm.set({ message: this.confirmMessages[action], order, action });
  }

  confirmPending(): void {
    const p = this.pendingConfirm();
    if (!p) return;
    this.pendingConfirm.set(null);
    switch (p.action) {
      case 'start':   this.startDelivery(p.order);  break;
      case 'deliver': this.markDelivered(p.order);   break;
      case 'fail':    this.markFailAttempt(p.order); break;
    }
  }

  dismissPending(): void {
    this.pendingConfirm.set(null);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
