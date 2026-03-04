import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, ProductPage } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);
  protected cartSvc   = inject(CartService);
  protected auth      = inject(AuthService);
  private router      = inject(Router);

  categories = signal<Category[]>([]);
  productPage = signal<ProductPage | null>(null);
  loading = signal(false);
  toastMsg = signal('');
  selectedProduct = signal<Product | null>(null);

  selectedCategoryId = signal<number | undefined>(undefined);
  searchQuery = signal('');
  currentPage = signal(0);
  pageSize = 12;

  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
    this.loadProducts();

    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadProducts();
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
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
      search: this.searchQuery() || undefined,
      page: this.currentPage(),
      size: this.pageSize
    }).subscribe({
      next: page => { this.productPage.set(page); this.loading.set(false); },
      error: ()   => this.loading.set(false)
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
  }
  closeDetail(): void { this.selectedProduct.set(null); }

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

  getCategoryIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('kitchen'))                          return 'kitchen';
    if (n.includes('clean'))                            return 'cleaning';
    if (n.includes('bathroom') || n.includes('bath'))   return 'bathroom';
    if (n.includes('living'))                           return 'living';
    if (n.includes('bedroom') || n.includes('bed'))     return 'bedroom';
    if (n.includes('storage'))                          return 'storage';
    if (n.includes('garden'))                           return 'garden';
    if (n.includes('baby') || n.includes('kid'))        return 'baby';
    if (n.includes('soap'))                             return 'soap';
    if (n.includes('tissue') || n.includes('paper'))    return 'tissue';
    return 'default';
  }
}
