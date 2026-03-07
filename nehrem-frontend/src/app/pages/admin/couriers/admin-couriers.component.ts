import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourierAdminService, CourierResponse } from '../../../core/services/courier-admin.service';

@Component({
  selector: 'app-admin-couriers',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './admin-couriers.component.html',
  styleUrl: './admin-couriers.component.scss'
})
export class AdminCouriersComponent implements OnInit {
  private courierSvc = inject(CourierAdminService);
  private fb         = inject(FormBuilder);

  couriers   = signal<CourierResponse[]>([]);
  loading    = signal(true);
  showForm   = signal(false);
  editingId  = signal<number | null>(null);
  submitting = signal(false);
  error      = signal('');

  form = this.fb.group({
    name:     ['', [Validators.required, Validators.maxLength(100)]],
    phone:    ['', Validators.maxLength(20)],
    username: ['', [Validators.required, Validators.maxLength(50),
                    Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    password: ['']
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.courierSvc.getAll().subscribe({
      next: list => { this.couriers.set(list); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.form.get('password')!.setValidators([Validators.required, Validators.minLength(4)]);
    this.form.get('password')!.updateValueAndValidity();
    this.error.set('');
    this.showForm.set(true);
  }

  openEdit(c: CourierResponse): void {
    this.editingId.set(c.id);
    this.form.patchValue({ name: c.name, phone: c.phone ?? '', username: c.username, password: '' });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.error.set('');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    const req = { name: v.name!, phone: v.phone ?? '', username: v.username!, password: v.password ?? undefined };
    const id  = this.editingId();

    const obs = id
      ? this.courierSvc.update(id, req)
      : this.courierSvc.create(req);

    obs.subscribe({
      next: () => { this.showForm.set(false); this.load(); this.submitting.set(false); },
      error: err => {
        this.error.set(err?.error?.message ?? 'Xəta baş verdi');
        this.submitting.set(false);
      }
    });
  }

  toggleActive(c: CourierResponse): void {
    this.courierSvc.toggleActive(c.id).subscribe({
      next: updated => this.couriers.update(list => list.map(x => x.id === updated.id ? updated : x))
    });
  }

  delete(c: CourierResponse): void {
    if (!confirm(`"${c.name}" adlı kuryeri silmək istəyirsiniz?`)) return;
    this.courierSvc.delete(c.id).subscribe({
      next: () => this.couriers.update(list => list.filter(x => x.id !== c.id)),
      error: err => alert(err?.error?.message ?? 'Kuryer silinə bilmədi')
    });
  }

  hasError(field: string, error = ''): boolean {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched) return false;
    return error ? ctrl.hasError(error) : ctrl.invalid;
  }
}
