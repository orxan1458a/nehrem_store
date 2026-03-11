import {
  Component, OnInit, OnDestroy, Output, EventEmitter, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService }    from '../../../core/services/cart.service';
import { Product }        from '../../../core/models/product.model';

interface FlashCard {
  product: Product;
  d: string;
  h: string;
  m: string;
  s: string;
  mode: 'hms' | 'dhm';
  expired: boolean;
}

@Component({
  selector: 'app-flash-sale',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flash-sale.component.html',
  styleUrl: './flash-sale.component.scss'
})
export class FlashSaleComponent implements OnInit, OnDestroy {
  @Output() cardClick  = new EventEmitter<Product>();
  @Output() addToCart  = new EventEmitter<Product>();

  private productSvc = inject(ProductService);
  private cartSvc    = inject(CartService);

  cards     = signal<FlashCard[]>([]);
  loading   = signal(true);
  toastMsg  = signal('');

  private _tick:    ReturnType<typeof setInterval> | null = null;
  private _refresh: ReturnType<typeof setInterval> | null = null;

  get hasCards(): boolean { return this.cards().some(c => !c.expired); }

  ngOnInit(): void {
    this._load();
    // Refresh the list every 60 s to pick up newly added flash deals or truly expired ones
    this._refresh = setInterval(() => this._load(), 60_000);
    // Tick countdown every second
    this._tick = setInterval(() => this._tickAll(), 1000);
  }

  ngOnDestroy(): void {
    if (this._tick)    clearInterval(this._tick);
    if (this._refresh) clearInterval(this._refresh);
  }

  private _load(): void {
    this.productSvc.getFlashSale().subscribe({
      next: products => {
        this.cards.set(products.map(p => this._toCard(p)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private _toCard(product: Product): FlashCard {
    const parts = this._computeParts(product);
    return { product, ...parts };
  }

  private _computeParts(product: Product): { d: string; h: string; m: string; s: string; mode: 'hms' | 'dhm'; expired: boolean } {
    const zero = { d: '00', h: '00', m: '00', s: '00', mode: 'hms' as const };
    if (!product.discountEndDate) return { ...zero, expired: false };
    const ms = new Date(product.discountEndDate).getTime() - Date.now();
    if (ms <= 0) return { ...zero, expired: true };
    const totalSec = Math.floor(ms / 1000);
    const totalH   = Math.floor(totalSec / 3600);
    if (totalH >= 24) {
      const d = Math.floor(totalH / 24);
      const h = totalH % 24;
      const m = Math.floor((totalSec % 3600) / 60);
      return {
        d: String(d).padStart(2, '0'),
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: '00',
        mode: 'dhm',
        expired: false
      };
    }
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return {
      d: '00',
      h: String(totalH).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0'),
      mode: 'hms',
      expired: false
    };
  }

  private _tickAll(): void {
    this.cards.update(list =>
      list.map(c => ({ ...c, ...this._computeParts(c.product) }))
    );
  }

  discountPercent(p: Product): number {
    if (!p.discountPrice) return 0;
    return Math.round((1 - p.discountPrice / p.price) * 100);
  }

  onAddToCart(event: MouseEvent, product: Product): void {
    event.stopPropagation();
    if (product.stockQuantity <= 0) return;
    this.cartSvc.addItem(product);
    this.addToCart.emit(product);
    this.toastMsg.set(`"${product.name}" səbətə əlavə edildi!`);
    setTimeout(() => this.toastMsg.set(''), 2500);
  }

  onCardClick(product: Product): void {
    this.cardClick.emit(product);
  }
}
