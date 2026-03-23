import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponse, OrderStatus, CourierInfo } from '../../../core/models/order.model';

type OrderAction = 'accept' | 'cancel' | 'deliver' | 'fail';

interface PendingConfirm {
  message: string;
  order: OrderResponse;
  action: OrderAction;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  private orderSvc = inject(OrderService);

  orders = signal<OrderResponse[]>([]);
  couriers = signal<CourierInfo[]>([]);
  loading = signal(true);
  totalPages = signal(0);
  currentPage = signal(0);
  expanded = signal<number | null>(null);
  activeFilter = signal<OrderStatus | 'ALL'>('ALL');
  actionLoading = signal<number | null>(null);
  /** Per-status order counts, e.g. { PENDING: 5, ACCEPTED: 3 }. */
  statusCounts = signal<Record<string, number>>({});

  /** Tracks per-row courier selection keyed by order id. Pre-populated from order.courier on load. */
  courierSelections: Record<number, number | string> = {};

  /** Holds the pending action waiting for user confirmation. Null means modal is closed. */
  pendingConfirm = signal<PendingConfirm | null>(null);

  readonly filters: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
    { label: 'Hamısı', value: 'ALL' },
    { label: 'Gözləyir', value: 'PENDING' },
    { label: 'Qəbul edildi', value: 'ACCEPTED' },
    { label: 'Yoldadır', value: 'OUT_FOR_DELIVERY' },
    { label: 'Çatdırıldı', value: 'DELIVERED' },
    { label: 'Uğursuz', value: 'FAIL_ATTEMPT' },
    { label: 'Ləğv edildi', value: 'CANCELLED' },
  ];

  ngOnInit(): void {
    this.loadOrders();
    this.loadCounts();
    this.orderSvc.getActiveCouriers().subscribe(c => this.couriers.set(c));
  }

  loadOrders(): void {
    this.loading.set(true);
    const status = this.activeFilter() === 'ALL' ? undefined : this.activeFilter() as OrderStatus;
    this.orderSvc.getAll(this.currentPage(), 20, status).subscribe({
      next: (page: any) => {
        this.orders.set(page.content);
        this.totalPages.set(page.totalPages);
        // Pre-populate courier selections from loaded orders
        for (const o of page.content) {
          this.courierSelections[o.id] = o.courier?.id ?? '';
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadCounts(): void {
    this.orderSvc.getOrderStatusCounts().subscribe({
      next: counts => this.statusCounts.set(counts),
      error: () => {}
    });
  }

  countFor(value: OrderStatus | 'ALL'): number | null {
    if (value === 'ALL') {
      const total = Object.values(this.statusCounts()).reduce((s, n) => s + n, 0);
      return total || null;
    }
    return this.statusCounts()[value] ?? null;
  }

  setFilter(f: OrderStatus | 'ALL'): void {
    this.activeFilter.set(f);
    this.currentPage.set(0);
    this.loadOrders();
  }

  goToPage(p: number): void {
    this.currentPage.set(p);
    this.loadOrders();
  }

  toggleExpand(id: number): void {
    this.expanded.update(v => v === id ? null : id);
  }

  printOrder(id: number): void {
    window.open(`/admin/orders/${id}/print`, '_blank');
  }

  /** Accept a PENDING order, optionally assigning the courier selected in the row dropdown. */
  accept(order: OrderResponse): void {
    const raw = this.courierSelections[order.id];
    const courierId = raw ? Number(raw) : null;
    this.actionLoading.set(order.id);
    this.orderSvc.acceptOrder(order.id, courierId).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.courierSelections[updated.id] = updated.courier?.id ?? '';
        this.actionLoading.set(null);
        this.loadCounts();
      },
      error: () => this.actionLoading.set(null)
    });
  }

  /** Cancel an order (any status). */
  cancel(order: OrderResponse): void {
    this.actionLoading.set(order.id);
    this.orderSvc.cancelOrder(order.id).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.actionLoading.set(null);
        this.loadCounts();
      },
      error: () => this.actionLoading.set(null)
    });
  }

  /** Generic status update via admin /status endpoint (not for FAIL_ATTEMPT). */
  setStatus(order: OrderResponse, status: OrderStatus): void {
    this.actionLoading.set(order.id);
    this.orderSvc.updateStatus(order.id, status).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.actionLoading.set(null);
        this.loadCounts();
      },
      error: () => this.actionLoading.set(null)
    });
  }

  /** Admin records a failed delivery attempt — prompts for a mandatory reason. */
  markFailAttempt(order: OrderResponse): void {
    const reason = window.prompt('Çatdırılma uğursuzluğunun səbəbi (məcburidir):');
    if (!reason || !reason.trim()) return;
    this.actionLoading.set(order.id);
    this.orderSvc.adminMarkFailAttempt(order.id, reason.trim()).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.actionLoading.set(null);
        this.loadCounts();
      },
      error: () => this.actionLoading.set(null)
    });
  }

  /**
   * Courier dropdown change handler.
   * - PENDING orders: store selection locally (applied when Accept is clicked).
   * - Other orders: assign courier immediately via API.
   */
  onCourierChange(order: OrderResponse, value: number | string): void {
    const courierId = value ? Number(value) : null;
    this.courierSelections[order.id] = value;

    if (order.orderStatus !== 'PENDING') {
      this.actionLoading.set(order.id);
      this.orderSvc.assignCourier(order.id, courierId).subscribe({
        next: updated => {
          this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
          this.courierSelections[updated.id] = updated.courier?.id ?? '';
          this.actionLoading.set(null);
        },
        error: () => this.actionLoading.set(null)
      });
    }
  }

  // ── Confirmation popup ────────────────────────────────────────────────────

  private readonly confirmMessages: Record<OrderAction, string> = {
    accept:  'Sifarişi qəbul etmək istədiyinizə əminsiniz?',
    cancel:  'Sifarişi ləğv etmək istədiyinizə əminsiniz?',
    deliver: 'Sifarişi çatdırılmış kimi qeyd etmək istədiyinizə əminsiniz?',
    fail:    'Uğursuz çatdırılma qeyd etmək istədiyinizə əminsiniz?',
  };

  askConfirm(order: OrderResponse, action: OrderAction): void {
    this.pendingConfirm.set({ message: this.confirmMessages[action], order, action });
  }

  confirmPending(): void {
    const p = this.pendingConfirm();
    if (!p) return;
    this.pendingConfirm.set(null);
    switch (p.action) {
      case 'accept':  this.accept(p.order);                    break;
      case 'cancel':  this.cancel(p.order);                    break;
      case 'deliver': this.setStatus(p.order, 'DELIVERED');    break;
      case 'fail':    this.markFailAttempt(p.order);           break;
    }
  }

  dismissPending(): void {
    this.pendingConfirm.set(null);
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: 'Gözləyir',
      ACCEPTED: 'Qəbul edildi',
      OUT_FOR_DELIVERY: 'Yoldadır',
      DELIVERED: 'Çatdırıldı',
      FAIL_ATTEMPT: 'Uğursuz çatdırılma',
      CANCELLED: 'Ləğv edildi',
    };
    return map[status] ?? status;
  }

  /** Maps a filter value to a CSS modifier for the badge, e.g. OUT_FOR_DELIVERY → out-for-delivery. */
  badgeClass(value: OrderStatus | 'ALL'): string {
    return value.toLowerCase().replace(/_/g, '-');
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
