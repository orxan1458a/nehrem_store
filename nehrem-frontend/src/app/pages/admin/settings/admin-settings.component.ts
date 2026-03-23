import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LogoService } from '../../../core/services/logo.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="settings-page">
      <h1 class="settings-page__title">Tənzimləmələr</h1>

      <!-- Logo Card -->
      <div class="settings-card">
        <h2 class="settings-card__heading">Tətbiq Loqosu</h2>

        <!-- Current logo preview -->
        <div class="logo-preview">
          @if (logoSvc.logo$ | async; as logoUrl) {
            <img [src]="logoSvc.bustUrl(logoUrl)" class="logo-preview__img" alt="Current logo" />
          } @else {
            <div class="logo-preview__placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.29C3.35 19.97 3.7 21 4.5 21C6.5 21 10.5 20 12 17C14 14 14.5 11.5 17 8Z" fill="#00BFA5"/>
                <path d="M17 8C15 10 13 12.5 12 17C14.5 17 16.5 15 17 13C17.5 11 17.5 9.5 17 8Z" fill="#00897B"/>
              </svg>
              <span>Default loqo istifadə edilir</span>
            </div>
          }
        </div>

        <!-- Preview of selected file (before upload) -->
        @if (previewUrl()) {
          <div class="logo-new-preview">
            <p class="logo-new-preview__label">Yeni loqo önizləməsi:</p>
            <img [src]="previewUrl()!" class="logo-preview__img" alt="New logo preview" />
          </div>
        }

        <!-- Alerts -->
        @if (successMsg()) {
          <div class="settings-alert settings-alert--success">{{ successMsg() }}</div>
        }
        @if (errorMsg()) {
          <div class="settings-alert settings-alert--error">{{ errorMsg() }}</div>
        }

        <!-- Upload controls -->
        <div class="logo-actions">
          <label class="btn btn--outline" for="logo-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Fayl seç
          </label>
          <input id="logo-input" type="file" accept=".png,.jpg,.jpeg,.svg,.webp"
            class="logo-input-hidden" (change)="onFileSelected($event)" />

          <button class="btn btn--primary" [disabled]="!selectedFile() || uploading()"
            (click)="uploadLogo()">
            @if (uploading()) {
              <span class="btn-spinner"></span> Yüklənir...
            } @else {
              Loqonu Yenilə
            }
          </button>

          @if (logoSvc.logo$ | async) {
            <button class="btn btn--danger-outline" [disabled]="uploading()"
              (click)="removeLogo()">
              Loqonu Sil
            </button>
          }
        </div>

        <p class="settings-hint">PNG, JPG, SVG və ya WEBP · Maks. 2 MB</p>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      max-width: 640px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 4rem;
    }
    .settings-page__title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 1.5rem;
    }
    .settings-card {
      background: #fff;
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
    }
    .settings-card__heading {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1.25rem;
    }
    .logo-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      min-height: 120px;
    }
    .logo-preview__img {
      max-width: 160px;
      max-height: 80px;
      object-fit: contain;
    }
    .logo-preview__placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .5rem;
      color: #999;
      font-size: .85rem;
    }
    .logo-new-preview {
      margin-bottom: 1rem;
    }
    .logo-new-preview__label {
      font-size: .8rem;
      color: #666;
      margin-bottom: .5rem;
    }
    .settings-alert {
      padding: .65rem 1rem;
      border-radius: 8px;
      font-size: .875rem;
      margin-bottom: 1rem;
      &--success { background: #e8f5e9; color: #2e7d32; }
      &--error   { background: #ffebee; color: #c62828; }
    }
    .logo-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: .75rem;
      margin-bottom: .75rem;
    }
    .logo-input-hidden { display: none; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      padding: .55rem 1.1rem;
      border-radius: 8px;
      font-size: .875rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity .15s;
      &:disabled { opacity: .55; cursor: not-allowed; }
      &--primary {
        background: #00BFA5;
        color: #fff;
        &:hover:not(:disabled) { background: #00897B; }
      }
      &--outline {
        background: transparent;
        border: 1.5px solid #00BFA5;
        color: #00BFA5;
        cursor: pointer;
        &:hover { background: #e0f7f4; }
      }
      &--danger-outline {
        background: transparent;
        border: 1.5px solid #e53935;
        color: #e53935;
        &:hover:not(:disabled) { background: #ffebee; }
      }
    }
    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: #fff;
      border-radius: 50%;
      display: inline-block;
      animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .settings-hint {
      font-size: .78rem;
      color: #aaa;
    }
  `]
})
export class AdminSettingsComponent {
  logoSvc = inject(LogoService);

  selectedFile = signal<File | null>(null);
  previewUrl   = signal<string | null>(null);
  uploading    = signal(false);
  successMsg   = signal('');
  errorMsg     = signal('');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.successMsg.set('');
    this.errorMsg.set('');

    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }
  }

  uploadLogo(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    this.logoSvc.uploadLogo(file).subscribe({
      next: res => {
        const newUrl = res.data?.value ?? null;
        this.logoSvc.setLogo(newUrl);
        this.selectedFile.set(null);
        this.previewUrl.set(null);
        this.uploading.set(false);
        this.successMsg.set('Loqo uğurla yeniləndi!');
      },
      error: err => {
        this.uploading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Loqo yüklənərkən xəta baş verdi.');
      }
    });
  }

  removeLogo(): void {
    this.logoSvc.setLogo(null);
    this.successMsg.set('Loqo silindi. Sayfanı yenilədikdən sonra default loqo göstəriləcək.');
  }
}
