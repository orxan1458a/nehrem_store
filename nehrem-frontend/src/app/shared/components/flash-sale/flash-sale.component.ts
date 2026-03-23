import {
  Component, OnInit, OnDestroy, Output, EventEmitter, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService }  from '../../../core/services/product.service';
import { CartService }     from '../../../core/services/cart.service';
import { HomepageService } from '../../../core/services/homepage.service';
import { Product }         from '../../../core/models/product.model';

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
  @Output() cardClick = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  private productSvc  = inject(ProductService);
  private cartSvc     = inject(CartService);
  private homepageSvc = inject(HomepageService);

  cards    = signal<FlashCard[]>([]);
  loading  = signal(true);
  toastMsg = signal('');
  showAll  = signal(false);

  /** Active (non-expired) cards */
  private activeCards = computed(() => this.cards().filter(c => !c.expired));

  /** Cards visible based on limit or showAll */
  displayedCards = computed(() => {
    const active = this.activeCards();
    if (this.showAll()) return active;
    const limit = this.homepageSvc.homepageDiscountLimit$.value;
    return active.slice(0, limit);
  });

  /** True when there are hidden cards to reveal */
  hasMore = computed(() =>
    !this.showAll() &&
    this.activeCards().length > this.homepageSvc.homepageDiscountLimit$.value
  );

  get hasCards(): boolean { return this.activeCards().length > 0; }

  private _tick:    ReturnType<typeof setInterval> | null = null;
  private _refresh: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this._load();
    this._refresh = setInterval(() => this._load(), 60_000);
    this._tick    = setInterval(() => this._tickAll(), 1000);
  }

  ngOnDestroy(): void {
    if (this._tick)    clearInterval(this._tick);
    if (this._refresh) clearInterval(this._refresh);
  }

  showAllCards(): void { this.showAll.set(true); }

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
    return { product, ...this._computeParts(product) };
  }

  private _computeParts(product: Product): { d: string; h: string; m: string; s: string; mode: 'hms' | 'dhm'; expired: boolean } {
    const zero = { d: '00', h: '00', m: '00', s: '00', mode: 'hms' as const };
    if (!product.discountEndDate) return { ...zero, expired: false };
    const ms = new Date(product.discountEndDate).getTime() - Date.now();
    if (ms <= 0) return { ...zero, expired: true };
    const totalSec = Math.floor(ms / 1000);
    const totalH   = Math.floor(totalSec / 3600);
    if (totalH >= 24) {
      return {
        d:    String(Math.floor(totalH / 24)).padStart(2, '0'),
        h:    String(totalH % 24).padStart(2, '0'),
        m:    String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0'),
        s:    '00',
        mode: 'dhm',
        expired: false
      };
    }
    return {
      d:    '00',
      h:    String(totalH).padStart(2, '0'),
      m:    String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0'),
      s:    String(totalSec % 60).padStart(2, '0'),
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
