import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderService } from '../../core/services/order.service';
import { OrderResponse, OrderStatus } from '../../core/models/order.model';

interface TimelineStage {
  key: OrderStatus;
  label: string;
  icon: string;
}

type StageState = 'completed' | 'active' | 'pending' | 'failed' | 'cancelled';

const STORAGE_KEY = 'guest_orders';

const DELIVERY_STAGES: TimelineStage[] = [
  { key: 'PENDING',          label: 'Gözləyir',   icon: '⏳' },
  { key: 'ACCEPTED',         label: 'Hazırlandı', icon: '📦' },
  { key: 'OUT_FOR_DELIVERY', label: 'Yoldadır',   icon: '🚚' },
  { key: 'DELIVERED',        label: 'Çatdırıldı', icon: '✅' },
];

const PICKUP_STAGES: TimelineStage[] = [
  { key: 'PENDING',   label: 'Gözləyir',   icon: '⏳' },
  { key: 'ACCEPTED',  label: 'Hazırlandı', icon: '📦' },
  { key: 'DELIVERED', label: 'Götürüldü',  icon: '✅' },
];

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0, ACCEPTED: 1, OUT_FOR_DELIVERY: 2, DELIVERED: 3,
};

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.scss',
})
export class MyOrdersComponent implements OnInit {
  private orderSvc = inject(OrderService);

  orders  = signal<OrderResponse[]>([]);
  loading = signal(true);
  selectedId = signal<number | null>(null);

  selectedOrder = computed(() => {
    const id = this.selectedId();
    return id == null ? null : (this.orders().find(o => o.id === id) ?? null);
  });

  ngOnInit(): void {
    const ids = this.storedIds();
    if (ids.length === 0) { this.loading.set(false); return; }

    forkJoin(
      ids.map(id => this.orderSvc.getById(id).pipe(catchError(() => of(null))))
    ).subscribe(results => {
      const valid = results.filter(Boolean) as OrderResponse[];
      // Sort newest first
      valid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.orders.set(valid);
      if (valid.length === 1) this.selectedId.set(valid[0].id);
      this.loading.set(false);
    });
  }

  selectOrder(id: number): void {
    this.selectedId.update(v => (v === id ? null : id));
  }

  stagesFor(order: OrderResponse): TimelineStage[] {
    return order.deliveryMethod === 'PICKUP' ? PICKUP_STAGES : DELIVERY_STAGES;
  }

  stageState(order: OrderResponse, stage: TimelineStage): StageState {
    const status = order.orderStatus;

    if (status === 'CANCELLED') {
      return stage.key === 'PENDING' ? 'cancelled' : 'pending';
    }

    if (status === 'FAIL_ATTEMPT') {
      const stageIdx = STATUS_ORDER[stage.key] ?? -1;
      // OUT_FOR_DELIVERY (index 2) is where the fail happened
      if (stageIdx < 2)  return 'completed';
      if (stageIdx === 2) return 'failed';
      return 'pending';
    }

    const currentIdx = STATUS_ORDER[status] ?? -1;
    const stageIdx   = STATUS_ORDER[stage.key] ?? -1;
    if (stageIdx <  currentIdx) return 'completed';
    if (stageIdx === currentIdx) return 'active';
    return 'pending';
  }

  statusClass(status: OrderStatus): string {
    return status.toLowerCase().replace(/_/g, '-');
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING:          'Gözləyir',
      ACCEPTED:         'Hazırlandı',
      OUT_FOR_DELIVERY: 'Yoldadır',
      DELIVERED:        'Çatdırıldı',
      FAIL_ATTEMPT:     'Uğursuz cəhd',
      CANCELLED:        'Ləğv edildi',
    };
    return map[status] ?? status;
  }

  private storedIds(): number[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Number.isFinite) : [];
    } catch { return []; }
  }
}
