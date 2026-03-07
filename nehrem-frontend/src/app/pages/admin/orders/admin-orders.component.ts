import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponse, OrderStatus, CourierInfo } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  private orderSvc = inject(OrderService);

  orders        = signal<OrderResponse[]>([]);
  couriers      = signal<CourierInfo[]>([]);
  loading       = signal(true);
  totalPages    = signal(0);
  currentPage   = signal(0);
  expanded      = signal<number | null>(null);
  activeFilter  = signal<OrderStatus | 'ALL'>('ALL');
  actionLoading = signal<number | null>(null);

  /** Tracks per-row courier selection for PENDING orders (not yet sent to API). */
  private courierSelections = new Map<number, number | null>();

  readonly filters: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
    { label: 'Hamısı',       value: 'ALL' },
    { label: 'Gözləyir',     value: 'PENDING' },
    { label: 'Qəbul edildi', value: 'ACCEPTED' },
    { label: 'Çatdırıldı',  value: 'DELIVERED' },
    { label: 'Ləğv edildi',  value: 'CANCELLED' },
  ];

  ngOnInit(): void {
    this.loadOrders();
    this.orderSvc.getActiveCouriers().subscribe(c => this.couriers.set(c));
  }

  loadOrders(): void {
    this.loading.set(true);
    const status = this.activeFilter() === 'ALL' ? undefined : this.activeFilter() as OrderStatus;
    this.orderSvc.getAll(this.currentPage(), 20, status).subscribe({
      next: (page: any) => {
        this.orders.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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

  /**
   * Accept a PENDING order, optionally assigning the courier selected in the row dropdown.
   */
  accept(order: OrderResponse): void {
    const courierId = this.courierSelections.get(order.id) ?? null;
    this.actionLoading.set(order.id);
    this.orderSvc.acceptOrder(order.id, courierId).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.courierSelections.delete(order.id);
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null)
    });
  }

  /**
   * Cancel an order (any status).
   */
  cancel(order: OrderResponse): void {
    this.actionLoading.set(order.id);
    this.orderSvc.cancelOrder(order.id).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null)
    });
  }

  /**
   * Mark an ACCEPTED order as DELIVERED (admin shortcut).
   */
  setStatus(order: OrderResponse, status: OrderStatus): void {
    this.actionLoading.set(order.id);
    this.orderSvc.updateStatus(order.id, status).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null)
    });
  }

  /**
   * Courier dropdown change handler.
   * - PENDING orders: store selection locally (applied when Accept is clicked).
   * - Other orders: assign courier immediately via API.
   */
  onCourierChange(order: OrderResponse, event: Event): void {
    const courierId = Number((event.target as HTMLSelectElement).value) || null;
    this.courierSelections.set(order.id, courierId);

    if (order.orderStatus !== 'PENDING') {
      this.actionLoading.set(order.id);
      this.orderSvc.assignCourier(order.id, courierId).subscribe({
        next: updated => {
          this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
          this.actionLoading.set(null);
        },
        error: () => this.actionLoading.set(null)
      });
    }
  }

  /** Returns the locally selected courierId for a given order row, or the already-assigned one. */
  getSelectedCourier(order: OrderResponse): number | string {
    if (this.courierSelections.has(order.id)) {
      return this.courierSelections.get(order.id) ?? '';
    }
    return order.courier?.id ?? '';
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING:   'Gözləyir',
      ACCEPTED:  'Qəbul edildi',
      DELIVERED: 'Çatdırıldı',
      CANCELLED: 'Ləğv edildi',
    };
    return map[status] ?? status;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
