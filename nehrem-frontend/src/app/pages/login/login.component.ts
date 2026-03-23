import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoService }     from '../../core/services/logo.service';
import { BrandingService } from '../../core/services/branding.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  logoSvc     = inject(LogoService);
  brandingSvc = inject(BrandingService);

  username = signal('');
  password = signal('');
  error    = signal('');
  loading  = signal(false);

  onSubmit(): void {
    if (!this.username() || !this.password()) {
      this.error.set('İstifadəçi adı və şifrəni daxil edin.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.username(), this.password()).subscribe({
      next: payload => {
        this.loading.set(false);
        if (payload.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (payload.role === 'COURIER') {
          this.router.navigate(['/courier']);
        }
      },
      error: err => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message ?? 'İstifadəçi adı və ya şifrə yanlışdır.'
        );
      }
    });
  }
}
