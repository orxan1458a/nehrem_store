import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CartService }   from '../../../core/services/cart.service';
import { AuthService }   from '../../../core/services/auth.service';
import { SearchService } from '../../../core/services/search.service';
import { UserService }   from '../../../core/services/user.service';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const np = group.get('newPassword')?.value;
  const cp = group.get('confirmPassword')?.value;
  return np && cp && np !== cp ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  cart      = inject(CartService);
  auth      = inject(AuthService);
  searchSvc = inject(SearchService);
  private router   = inject(Router);
  private fb       = inject(FormBuilder);
  private userSvc  = inject(UserService);

  menuOpen     = signal(false);
  showPwdModal = signal(false);
  submitting   = signal(false);
  pwdSuccess   = signal('');
  pwdError     = signal('');

  pwdForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordsMatchValidator });

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void  { this.menuOpen.set(false); }

  openPwdModal(): void {
    this.pwdForm.reset();
    this.pwdSuccess.set('');
    this.pwdError.set('');
    this.showPwdModal.set(true);
  }

  closePwdModal(): void { this.showPwdModal.set(false); }

  onChangePwd(): void {
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.pwdSuccess.set('');
    this.pwdError.set('');

    const v = this.pwdForm.getRawValue();
    this.userSvc.changePassword({
      currentPassword: v.currentPassword!,
      newPassword:     v.newPassword!,
      confirmPassword: v.confirmPassword!
    }).subscribe({
      next: msg => {
        this.pwdSuccess.set(msg);
        this.pwdForm.reset();
        this.submitting.set(false);
      },
      error: err => {
        this.pwdError.set(err?.error?.message ?? 'Xəta baş verdi');
        this.submitting.set(false);
      }
    });
  }

  hasError(field: string, code = ''): boolean {
    const ctrl = this.pwdForm.get(field);
    if (!ctrl?.touched) return false;
    return code ? ctrl.hasError(code) : ctrl.invalid;
  }

  get passwordsMismatch(): boolean {
    return !!(this.pwdForm.get('confirmPassword')?.touched && this.pwdForm.hasError('passwordsMismatch'));
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSvc.set(value);
    this.router.navigate(['/shop']);
  }

  clearSearch(): void { this.searchSvc.clear(); }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
