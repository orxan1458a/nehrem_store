import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { FlashSaleComponent }   from '../../shared/components/flash-sale/flash-sale.component';
import { ProductService }  from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService }     from '../../core/services/cart.service';
import { AuthService }     from '../../core/services/auth.service';
import { SearchService }   from '../../core/services/search.service';
import { Product, ProductPage } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, FlashSaleComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit, OnDestroy {
  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);
  protected cartSvc   = inject(CartService);
  protected auth      = inject(AuthService);
  searchSvc           = inject(SearchService);
  private router      = inject(Router);

  categories  = signal<Category[]>([]);
  productPage = signal<ProductPage | null>(null);
  loading     = signal(false);
  toastMsg    = signal('');
  selectedProduct = signal<Product | null>(null);

  selectedCategoryId = signal<number | undefined>(undefined);
  currentPage = signal(0);
  pageSize    = 12;

  // Detail sheet countdown
  sheetCountdown = signal<string | null>(null);
  private _sheetTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
    this.loadProducts();

    // React to search changes (from header search OR shop page search input)
    this.searchSvc.changes$.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadProducts();
    });
  }

  onSearch(value: string): void {
    this.searchSvc.set(value);
  }

  selectCategory(id?: number): void {
    this.selectedCategoryId.set(id);
    this.currentPage.set(0);
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productSvc.getAll({
      categoryId: this.selectedCategoryId(),
      search:     this.searchSvc.query() || undefined,
      page:       this.currentPage(),
      size:       this.pageSize
    }).subscribe({
      next: page => { this.productPage.set(page); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  goToPage(p: number): void {
    this.currentPage.set(p);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart(product: Product): void {
    this.cartSvc.addItem(product);
    this.showToast(`"${product.name}" səbətə əlavə edildi!`);
  }

  goToCart(): void { this.router.navigate(['/cart']); }

  goToEdit(product: Product): void {
    this.closeDetail();
    this.router.navigate(['/admin/products'], { queryParams: { editId: product.id } });
  }

  openDetail(product: Product): void {
    this.selectedProduct.set(product);
    this.productSvc.incrementView(product.id).subscribe();
    // Start countdown if product has a limited-time discount
    if (this._sheetTimer) clearInterval(this._sheetTimer);
    if (product.discountEndDate) {
      const tick = () => {
        const ms = new Date(product.discountEndDate!).getTime() - Date.now();
        if (ms <= 0) { this.sheetCountdown.set(null); return; }
        const h = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
        const m = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
        const s = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0');
        this.sheetCountdown.set(`${h}:${m}:${s}`);
      };
      tick();
      this._sheetTimer = setInterval(tick, 1000);
    } else {
      this.sheetCountdown.set(null);
    }
  }
  ngOnDestroy(): void {
    if (this._sheetTimer) clearInterval(this._sheetTimer);
  }

  closeDetail(): void {
    this.selectedProduct.set(null);
    if (this._sheetTimer) { clearInterval(this._sheetTimer); this._sheetTimer = null; }
    this.sheetCountdown.set(null);
  }

  addToCartFromDetail(product: Product): void {
    this.addToCart(product);
    this.closeDetail();
  }

  private showToast(msg: string): void {
    this.toastMsg.set(msg);
    setTimeout(() => this.toastMsg.set(''), 3000);
  }

  get pages(): number[] {
    const total = this.productPage()?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i);
  }
}
