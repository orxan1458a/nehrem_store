import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponse } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  private orderSvc = inject(OrderService);

  orders      = signal<OrderResponse[]>([]);
  loading     = signal(false);
  totalPages  = signal(0);
  currentPage = signal(0);
  expanded    = signal<number | null>(null);

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true);
    this.orderSvc.getAll(this.currentPage(), 20).subscribe({
      next: (page: any) => {
        this.orders.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
