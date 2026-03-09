import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { Product, ProductPage, ProductRequest } from '../../../core/models/product.model';
import { InventoryBatch } from '../../../core/models/inventory.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  private productSvc   = inject(ProductService);
  private categorySvc  = inject(CategoryService);
  private inventorySvc = inject(InventoryService);
  private fb           = inject(FormBuilder);
  private route        = inject(ActivatedRoute);
  private destroy$     = new Subject<void>();

  products      = signal<Product[]>([]);
  categories    = signal<Category[]>([]);
  loading       = signal(false);
  showForm      = signal(false);
  editingId     = signal<number | null>(null);
  submitting    = signal(false);
  error         = signal('');

  // Pagination + search
  searchQuery   = signal('');
  currentPage   = signal(0);
  totalPages    = signal(0);
  totalElements = signal(0);
  readonly pageSize = 10;

  private search$ = new Subject<string>();

  selectedImage = signal<File | null>(null);
  previewUrl    = signal<string | null>(null);

  // ── Add Stock modal ──────────────────────────────────────────────────────
  showStockModal     = signal(false);
  stockingProduct    = signal<Product | null>(null);
  stockBatches       = signal<InventoryBatch[]>([]);
  stockLoading       = signal(false);
  stockSubmitting    = signal(false);
  stockError         = signal('');

  batchForm = this.fb.group({
    purchasePrice: [null as number | null, [Validators.required, Validators.min(0.01)]],
    quantity:      [null as number | null, [Validators.required, Validators.min(1)]]
  });

  // ── Product form ─────────────────────────────────────────────────────────
  form = this.fb.group({
    name:           ['', [Validators.required, Validators.maxLength(255)]],
    description:    [''],
    price:          [null as number | null, [Validators.required, Validators.min(0.01)]],
    discountPrice:  [null as number | null],
    limitedDiscount:[false],
    discountEndDate:[null as string | null],
    stockQuantity:  [null as number | null, [Validators.required, Validators.min(0)]],
    categoryId:     [null as number | null],
    purchasePrice:  [null as number | null, [Validators.min(0.01)]]
  });

  // Preset duration options (hours)
  readonly durations = [
    { label: '1 saat',  hours: 1 },
    { label: '1 gün',   hours: 24 },
    { label: '3 gün',   hours: 72 },
    { label: '7 gün',   hours: 168 },
  ];

  get limitedDiscountEnabled(): boolean {
    return !!this.form.get('limitedDiscount')?.value;
  }

  ngOnInit(): void {
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
    this.loadProducts();

    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadProducts();
    });

    const editId = this.route.snapshot.queryParamMap.get('editId');
    if (editId) {
      this.productSvc.getById(+editId).subscribe(p => this.openEdit(p));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.currentPage.set(p);
    this.loadProducts();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productSvc.getAdminAll({
      search: this.searchQuery() || undefined,
      page:   this.currentPage(),
      size:   this.pageSize
    }).subscribe({
      next: (page: ProductPage) => {
        this.products.set(page.content);
        this.totalPages.set(page.totalPages);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ limitedDiscount: false });
    this.selectedImage.set(null);
    this.previewUrl.set(null);
    this.error.set('');
    this.showForm.set(true);
  }

  openEdit(product: Product): void {
    this.editingId.set(product.id);
    const hasEndDate = !!product.discountEndDate;
    // Convert UTC Instant string ("...Z") to local time for datetime-local input
    const endDateLocal = hasEndDate
      ? (() => {
          const d = new Date(product.discountEndDate!);
          const pad = (n: number) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        })()
      : null;

    this.form.patchValue({
      name:           product.name,
      description:    product.description ?? '',
      price:          product.price,
      discountPrice:  product.discountPrice ?? null,
      limitedDiscount:hasEndDate,
      discountEndDate:endDateLocal,
      stockQuantity:  product.stockQuantity,
      categoryId:     product.categoryId ?? null,
      purchasePrice:  null
    });
    this.selectedImage.set(null);
    this.previewUrl.set(product.imageUrl ? `http://localhost:8080${product.imageUrl}` : null);
    this.error.set('');
    this.showForm.set(true);
  }

  onImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedImage.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  setDiscountDuration(hours: number): void {
    const end = new Date(Date.now() + hours * 3_600_000);
    // datetime-local expects local time "YYYY-MM-DDTHH:mm" — NOT toISOString() which is UTC
    const pad = (n: number) => String(n).padStart(2, '0');
    const local = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
    this.form.get('discountEndDate')?.setValue(local);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.error.set('');

    const val = this.form.getRawValue();

    // Convert local datetime string to ISO string for the API
    let discountEndDate: string | undefined;
    if (val.limitedDiscount && val.discountEndDate) {
      discountEndDate = new Date(val.discountEndDate).toISOString();
    }

    const req: ProductRequest = {
      name:           val.name!,
      description:    val.description || undefined,
      price:          val.price!,
      discountPrice:  val.discountPrice || undefined,
      discountEndDate,
      stockQuantity:  val.stockQuantity!,
      categoryId:     val.categoryId || undefined,
      purchasePrice:  val.purchasePrice || undefined
    };

    const image = this.selectedImage() ?? undefined;
    const id    = this.editingId();

    const obs = id
      ? this.productSvc.update(id, req, image)
      : this.productSvc.create(req, image);

    obs.subscribe({
      next: () => { this.showForm.set(false); this.loadProducts(); this.submitting.set(false); },
      error: err => { this.error.set(err?.error?.message ?? 'Məhsul saxlanılarkən xəta baş verdi'); this.submitting.set(false); }
    });
  }

  delete(id: number): void {
    if (!confirm('Bu məhsulu silmək istəyirsiniz?')) return;
    this.productSvc.delete(id).subscribe(() => this.loadProducts());
  }

  toggleActive(id: number): void {
    this.productSvc.toggleActive(id).subscribe(() => this.loadProducts());
  }

  hasError(field: string, error = ''): boolean {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched) return false;
    return error ? ctrl.hasError(error) : ctrl.invalid;
  }

  hasBatchError(field: string, error = ''): boolean {
    const ctrl = this.batchForm.get(field);
    if (!ctrl?.touched) return false;
    return error ? ctrl.hasError(error) : ctrl.invalid;
  }

  /** Human-readable remaining time for a product's discount end date. */
  discountTimeRemaining(product: Product): string | null {
    if (!product.discountEndDate) return null;
    const ms = new Date(product.discountEndDate).getTime() - Date.now();
    if (ms <= 0) return 'Bitmişdir';
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    if (h >= 48) return `${Math.floor(h / 24)} gün`;
    if (h >= 1)  return `${h} saat ${m} dəq`;
    return `${m} dəqiqə`;
  }

  // ── Add Stock modal ──────────────────────────────────────────────────────

  openAddStock(product: Product): void {
    this.stockingProduct.set(product);
    this.stockBatches.set([]);
    this.batchForm.reset();
    this.stockError.set('');
    this.showStockModal.set(true);
    this.stockLoading.set(true);
    this.inventorySvc.getBatches(product.id).subscribe({
      next: batches => { this.stockBatches.set(batches); this.stockLoading.set(false); },
      error: ()      => this.stockLoading.set(false)
    });
  }

  closeStockModal(): void {
    this.showStockModal.set(false);
    this.stockingProduct.set(null);
  }

  submitBatch(): void {
    if (this.batchForm.invalid) { this.batchForm.markAllAsTouched(); return; }
    const product = this.stockingProduct();
    if (!product) return;

    this.stockSubmitting.set(true);
    this.stockError.set('');
    const val = this.batchForm.getRawValue();

    this.inventorySvc.addBatch(product.id, {
      purchasePrice: val.purchasePrice!,
      quantity:      val.quantity!
    }).subscribe({
      next: batch => {
        this.stockBatches.update(list => [...list, batch]);
        this.batchForm.reset();
        this.stockSubmitting.set(false);
        this.loadProducts();
      },
      error: err => {
        this.stockError.set(err?.error?.message ?? 'Xəta baş verdi');
        this.stockSubmitting.set(false);
      }
    });
  }
}
