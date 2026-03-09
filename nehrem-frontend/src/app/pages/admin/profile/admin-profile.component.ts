import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPwd     = group.get('newPassword')?.value;
  const confirmPwd = group.get('confirmPassword')?.value;
  return newPwd && confirmPwd && newPwd !== confirmPwd ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrl:    './admin-profile.component.scss'
})
export class AdminProfileComponent {
  private userSvc = inject(UserService);
  private auth    = inject(AuthService);
  private fb      = inject(FormBuilder);

  submitting = signal(false);
  success    = signal('');
  error      = signal('');

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordsMatchValidator });

  get username(): string { return this.auth.user()?.username ?? ''; }
  get name():     string { return this.auth.user()?.name     ?? ''; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.submitting.set(true);
    this.success.set('');
    this.error.set('');

    const v = this.form.getRawValue();

    this.userSvc.changePassword({
      currentPassword: v.currentPassword!,
      newPassword:     v.newPassword!,
      confirmPassword: v.confirmPassword!
    }).subscribe({
      next: msg => {
        this.success.set(msg);
        this.form.reset();
        this.submitting.set(false);
      },
      error: err => {
        this.error.set(err?.error?.message ?? 'Xəta baş verdi');
        this.submitting.set(false);
      }
    });
  }

  hasError(field: string, errorCode = ''): boolean {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched) return false;
    return errorCode ? ctrl.hasError(errorCode) : ctrl.invalid;
  }

  get passwordsMismatch(): boolean {
    return !!(this.form.get('confirmPassword')?.touched && this.form.hasError('passwordsMismatch'));
  }
}
