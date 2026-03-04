import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

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

    setTimeout(() => {
      const ok = this.auth.login(this.username(), this.password());
      this.loading.set(false);
      if (ok) {
        this.router.navigate(['/admin']);
      } else {
        this.error.set('İstifadəçi adı və ya şifrə yanlışdır.');
      }
    }, 400);
  }
}
