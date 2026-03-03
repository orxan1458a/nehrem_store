import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss'
})
export class AdminCategoriesComponent implements OnInit {
  private categorySvc = inject(CategoryService);
  private fb          = inject(FormBuilder);

  categories = signal<Category[]>([]);
  loading    = signal(false);
  showForm   = signal(false);
  editingId  = signal<number | null>(null);
  submitting = signal(false);
  error      = signal('');

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.maxLength(100)]],
    description: ['']
  });

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.loading.set(true);
    this.categorySvc.getAll().subscribe({
      next: c => { this.categories.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.error.set('');
    this.showForm.set(true);
  }

  openEdit(cat: Category): void {
    this.editingId.set(cat.id);
    this.form.patchValue({ name: cat.name, description: cat.description ?? '' });
    this.error.set('');
    this.showForm.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.error.set('');

    const val = this.form.getRawValue();
    const req = { name: val.name!, description: val.description || undefined };
    const id  = this.editingId();

    const obs = id
      ? this.categorySvc.update(id, req)
      : this.categorySvc.create(req);

    obs.subscribe({
      next: () => { this.showForm.set(false); this.loadCategories(); this.submitting.set(false); },
      error: err => { this.error.set(err?.error?.message ?? 'Error saving category'); this.submitting.set(false); }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.categorySvc.delete(id).subscribe({
      next: () => this.loadCategories(),
      error: err => alert(err?.error?.message ?? 'Cannot delete category')
    });
  }

  hasError(field: string, error = ''): boolean {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched) return false;
    return error ? ctrl.hasError(error) : ctrl.invalid;
  }
}
