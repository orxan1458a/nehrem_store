import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, ProductRequest } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private fb          = inject(FormBuilder);

  products   = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading    = signal(false);
  showForm   = signal(false);
  editingId  = signal<number | null>(null);
  submitting = signal(false);
  error      = signal('');

  selectedImage = signal<File | null>(null);
  previewUrl    = signal<string | null>(null);

  form = this.fb.group({
    name:          ['', [Validators.required, Validators.maxLength(255)]],
    description:   [''],
    price:         [null as number | null, [Validators.required, Validators.min(0.01)]],
    discountPrice: [null as number | null],
    stockQuantity: [null as number | null, [Validators.required, Validators.min(0)]],
    categoryId:    [null as number | null]
  });

  ngOnInit(): void {
    this.loadProducts();
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productSvc.getAll({ size: 100 }).subscribe({
      next: p => { this.products.set(p.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.selectedImage.set(null);
    this.previewUrl.set(null);
    this.error.set('');
    this.showForm.set(true);
  }

  openEdit(product: Product): void {
    this.editingId.set(product.id);
    this.form.patchValue({
      name:          product.name,
      description:   product.description ?? '',
      price:         product.price,
      discountPrice: product.discountPrice ?? null,
      stockQuantity: product.stockQuantity,
      categoryId:    product.categoryId ?? null
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

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.error.set('');

    const val = this.form.getRawValue();
    const req: ProductRequest = {
      name:          val.name!,
      description:   val.description || undefined,
      price:         val.price!,
      discountPrice: val.discountPrice || undefined,
      stockQuantity: val.stockQuantity!,
      categoryId:    val.categoryId || undefined
    };

    const image = this.selectedImage() ?? undefined;
    const id    = this.editingId();

    const obs = id
      ? this.productSvc.update(id, req, image)
      : this.productSvc.create(req, image);

    obs.subscribe({
      next: () => { this.showForm.set(false); this.loadProducts(); this.submitting.set(false); },
      error: err => { this.error.set(err?.error?.message ?? 'Error saving product'); this.submitting.set(false); }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this product?')) return;
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
}
