import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { OrderResponse } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-print.component.html',
  styleUrl: './order-print.component.scss'
})
export class OrderPrintComponent implements OnInit, OnDestroy {
  private route      = inject(ActivatedRoute);
  private orderSvc   = inject(OrderService);

  order: OrderResponse | null = null;
  loading = true;
  error   = '';

  ngOnInit(): void {
    document.body.classList.add('print-page');
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderSvc.getById(id).subscribe({
      next: o => {
        this.order   = o;
        this.loading = false;
        setTimeout(() => window.print(), 300);
      },
      error: () => {
        this.error   = 'Sifariş tapılmadı.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('print-page');
  }
}
