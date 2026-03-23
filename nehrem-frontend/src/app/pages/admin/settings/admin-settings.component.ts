import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { LogoService }     from '../../../core/services/logo.service';
import { BrandingService } from '../../../core/services/branding.service';
import { HomepageService } from '../../../core/services/homepage.service';
import { UserService }     from '../../../core/services/user.service';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const np = group.get('newPassword')?.value;
  const cp = group.get('confirmPassword')?.value;
  return np && cp && np !== cp ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [AsyncPipe, FormsModule, ReactiveFormsModule],
  template: `
    <div class="settings-page">
      <h1 class="settings-page__title">Tənzimləmələr</h1>

      <!-- ── Logo ──────────────────────────────────────────────────────── -->
      <div class="settings-card">
        <h2 class="settings-card__heading">Tətbiq Loqosu</h2>

        <div class="preview-box">
          @if (logoSvc.logo$ | async; as logoUrl) {
            <img [src]="logoSvc.bustUrl(logoUrl)" class="preview-img" alt="Current logo" />
          } @else {
            <div class="preview-placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.29C3.35 19.97 3.7 21 4.5 21C6.5 21 10.5 20 12 17C14 14 14.5 11.5 17 8Z" fill="#00BFA5"/>
                <path d="M17 8C15 10 13 12.5 12 17C14.5 17 16.5 15 17 13C17.5 11 17.5 9.5 17 8Z" fill="#00897B"/>
              </svg>
              <span>Default loqo istifadə edilir</span>
            </div>
          }
        </div>

        @if (logoPreview()) {
          <div class="new-preview">
            <p class="new-preview__label">Önizləmə:</p>
            <img [src]="logoPreview()!" class="preview-img" alt="New logo preview" />
          </div>
        }

        @if (logoSuccess()) { <div class="alert alert--success">{{ logoSuccess() }}</div> }
        @if (logoError())   { <div class="alert alert--error">{{ logoError() }}</div> }

        <div class="actions">
          <label class="btn btn--outline" for="logo-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Fayl seç
          </label>
          <input id="logo-input" type="file" accept=".png,.jpg,.jpeg,.svg,.webp"
            class="file-hidden" (change)="onLogoSelected($event)" />

          <button class="btn btn--primary" [disabled]="!logoFile() || logoUploading()" (click)="uploadLogo()">
            @if (logoUploading()) { <span class="spinner"></span> Yüklənir... }
            @else { Loqonu Yenilə }
          </button>

          @if (logoSvc.logo$ | async) {
            <button class="btn btn--danger-outline" [disabled]="logoUploading()" (click)="removeLogo()">
              Loqonu Sil
            </button>
          }
        </div>
        <p class="hint">PNG, JPG, SVG və ya WEBP · Maks. 2 MB</p>
      </div>

      <!-- ── App Name ───────────────────────────────────────────────────── -->
      <div class="settings-card">
        <h2 class="settings-card__heading">Tətbiq Adı</h2>

        <div class="field-row">
          <input class="text-input" type="text" [(ngModel)]="appNameInput"
            placeholder="məs. EvTrend" maxlength="60" />
          <button class="btn btn--primary" [disabled]="!appNameInput.trim() || appNameSaving()"
            (click)="saveAppName()">
            @if (appNameSaving()) { <span class="spinner"></span> Saxlanılır... }
            @else { Saxla }
          </button>
        </div>

        <p class="current-val">
          Cari: <strong>{{ brandingSvc.appName$ | async }}</strong>
        </p>

        @if (appNameSuccess()) { <div class="alert alert--success">{{ appNameSuccess() }}</div> }
        @if (appNameError())   { <div class="alert alert--error">{{ appNameError() }}</div> }
      </div>

      <!-- ── Favicon ────────────────────────────────────────────────────── -->
      <div class="settings-card">
        <h2 class="settings-card__heading">Favicon</h2>

        <div class="preview-box preview-box--small">
          @if (brandingSvc.favicon$ | async; as faviconUrl) {
            <img [src]="faviconUrl" class="favicon-img" alt="Current favicon" />
          } @else {
            <div class="preview-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" width="32" height="32">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h4"/>
              </svg>
              <span>Default favicon istifadə edilir</span>
            </div>
          }
        </div>

        @if (faviconPreview()) {
          <div class="new-preview">
            <p class="new-preview__label">Önizləmə:</p>
            <img [src]="faviconPreview()!" class="favicon-img" alt="New favicon preview" />
          </div>
        }

        @if (faviconSuccess()) { <div class="alert alert--success">{{ faviconSuccess() }}</div> }
        @if (faviconError())   { <div class="alert alert--error">{{ faviconError() }}</div> }

        <div class="actions">
          <label class="btn btn--outline" for="favicon-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Fayl seç
          </label>
          <input id="favicon-input" type="file" accept=".ico,.png"
            class="file-hidden" (change)="onFaviconSelected($event)" />

          <button class="btn btn--primary" [disabled]="!faviconFile() || faviconUploading()"
            (click)="uploadFavicon()">
            @if (faviconUploading()) { <span class="spinner"></span> Yüklənir... }
            @else { Favicon Yenilə }
          </button>
        </div>
        <p class="hint">ICO və ya PNG · Maks. 1 MB</p>
      </div>

      <!-- ── Homepage Discount Limit ────────────────────────────────────── -->
      <div class="settings-card">
        <h2 class="settings-card__heading">Flash Endirim Limiti</h2>
        <p class="current-val">
          Ana səhifədə göstərilən endirimli məhsul sayı:
          <strong>{{ homepageSvc.homepageDiscountLimit$ | async }}</strong>
        </p>

        <div class="field-row">
          <input class="text-input" type="number" [(ngModel)]="discountLimitInput"
            placeholder="məs. 5" min="1" max="50" />
          <button class="btn btn--primary"
            [disabled]="!discountLimitInput || discountLimitInput < 1 || limitSaving()"
            (click)="saveDiscountLimit()">
            @if (limitSaving()) { <span class="spinner"></span> Saxlanılır... }
            @else { Saxla }
          </button>
        </div>

        @if (limitSuccess()) { <div class="alert alert--success">{{ limitSuccess() }}</div> }
        @if (limitError())   { <div class="alert alert--error">{{ limitError() }}</div> }

        <p class="hint">Minimum 1, maksimum 50. "Hamısını göstər" düyməsi bu limitdən sonra görünür.</p>
      </div>

      <!-- ── Change Password ────────────────────────────────────────────── -->
      <div class="settings-card">
        <h2 class="settings-card__heading">Şifrəni Dəyiş</h2>

        @if (pwdSuccess()) { <div class="alert alert--success">{{ pwdSuccess() }}</div> }
        @if (pwdError())   { <div class="alert alert--error">{{ pwdError() }}</div> }

        <form [formGroup]="pwdForm" (ngSubmit)="onChangePwd()" autocomplete="off" novalidate
              class="pwd-form">

          <div class="pwd-field">
            <label for="st-cur">Cari Şifrə</label>
            <input id="st-cur" type="password" formControlName="currentPassword"
              autocomplete="current-password" placeholder="Cari şifrənizi daxil edin"
              [class.error]="pwdHasError('currentPassword')" />
            @if (pwdHasError('currentPassword', 'required')) {
              <span class="field-err">Cari şifrə tələb olunur</span>
            }
          </div>

          <div class="pwd-field">
            <label for="st-new">Yeni Şifrə</label>
            <input id="st-new" type="password" formControlName="newPassword"
              autocomplete="new-password" placeholder="Ən az 6 simvol"
              [class.error]="pwdHasError('newPassword')" />
            @if (pwdHasError('newPassword', 'required')) {
              <span class="field-err">Yeni şifrə tələb olunur</span>
            } @else if (pwdHasError('newPassword', 'minlength')) {
              <span class="field-err">Yeni şifrə ən az 6 simvol olmalıdır</span>
            }
          </div>

          <div class="pwd-field">
            <label for="st-conf">Yeni Şifrəni Təsdiqlə</label>
            <input id="st-conf" type="password" formControlName="confirmPassword"
              autocomplete="new-password" placeholder="Yeni şifrəni təkrar daxil edin"
              [class.error]="pwdHasError('confirmPassword') || pwdMismatch" />
            @if (pwdHasError('confirmPassword', 'required')) {
              <span class="field-err">Şifrənin təkrarı tələb olunur</span>
            } @else if (pwdMismatch) {
              <span class="field-err">Şifrələr uyğun gəlmir</span>
            }
          </div>

          <div class="pwd-actions">
            <button type="button" class="btn btn--outline" (click)="resetPwdForm()">Sıfırla</button>
            <button type="submit" class="btn btn--primary"
              [disabled]="pwdForm.invalid || pwdSubmitting()">
              @if (pwdSubmitting()) { <span class="spinner"></span> Yenilənir... }
              @else { Şifrəni Yenilə }
            </button>
          </div>

        </form>
      </div>

    </div>
  `,
  styles: [`
    .settings-page {
      max-width: 640px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 4rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .settings-page__title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: .25rem;
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
      margin-bottom: 1.1rem;
    }
    .preview-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      min-height: 110px;
      &--small { min-height: 72px; padding: 1rem; }
    }
    .preview-img  { max-width: 160px; max-height: 80px; object-fit: contain; }
    .favicon-img  { width: 32px; height: 32px; object-fit: contain; }
    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .4rem;
      color: #bbb;
      font-size: .82rem;
    }
    .new-preview { margin-bottom: 1rem; }
    .new-preview__label { font-size: .78rem; color: #666; margin-bottom: .4rem; }
    .alert {
      padding: .6rem .9rem;
      border-radius: 8px;
      font-size: .875rem;
      margin-bottom: .9rem;
      &--success { background: #e8f5e9; color: #2e7d32; }
      &--error   { background: #ffebee; color: #c62828; }
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: .75rem;
      margin-bottom: .6rem;
    }
    .field-row {
      display: flex;
      gap: .75rem;
      margin-bottom: .6rem;
    }
    .text-input {
      flex: 1;
      padding: .55rem .9rem;
      border: 1.5px solid #e0e0e0;
      border-radius: 8px;
      font-size: .9rem;
      outline: none;
      &:focus { border-color: #00BFA5; }
    }
    .current-val {
      font-size: .82rem;
      color: #888;
      margin-bottom: .6rem;
      strong { color: #333; }
    }
    .file-hidden { display: none; }
    .hint { font-size: .78rem; color: #bbb; }
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
      transition: background .15s, opacity .15s;
      white-space: nowrap;
      &:disabled { opacity: .55; cursor: not-allowed; }
      &--primary {
        background: #00BFA5; color: #fff;
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
    .spinner {
      width: 13px; height: 13px;
      border: 2px solid rgba(255,255,255,.35);
      border-top-color: #fff;
      border-radius: 50%;
      display: inline-block;
      animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Password form */
    .pwd-form {
      display: flex;
      flex-direction: column;
      gap: .9rem;
    }
    .pwd-field {
      display: flex;
      flex-direction: column;
      gap: .28rem;

      label { font-size: .82rem; font-weight: 600; color: #444; }

      input {
        padding: .6rem .9rem;
        border: 1.5px solid #ddd;
        border-radius: 8px;
        font-size: .9rem;
        font-family: inherit;
        outline: none;
        transition: border-color .2s;
        &:focus { border-color: #00BFA5; }
        &.error { border-color: #e63946; }
      }
    }
    .field-err { font-size: .74rem; color: #e63946; }
    .pwd-actions {
      display: flex;
      justify-content: flex-end;
      gap: .65rem;
      padding-top: .25rem;
    }
  `]
})
export class AdminSettingsComponent {
  logoSvc     = inject(LogoService);
  brandingSvc = inject(BrandingService);
  homepageSvc = inject(HomepageService);
  private userSvc = inject(UserService);
  private fb      = inject(FormBuilder);

  // ── Logo state ──────────────────────────────────────────────────────────
  logoFile      = signal<File | null>(null);
  logoPreview   = signal<string | null>(null);
  logoUploading = signal(false);
  logoSuccess   = signal('');
  logoError     = signal('');

  // ── App Name state ──────────────────────────────────────────────────────
  appNameInput   = '';
  appNameSaving  = signal(false);
  appNameSuccess = signal('');
  appNameError   = signal('');

  // ── Homepage Discount Limit state ──────────────────────────────────────
  discountLimitInput = 0;
  limitSaving        = signal(false);
  limitSuccess       = signal('');
  limitError         = signal('');

  // ── Password state ──────────────────────────────────────────────────────
  pwdSubmitting = signal(false);
  pwdSuccess    = signal('');
  pwdError      = signal('');

  pwdForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordsMatchValidator });

  // ── Favicon state ───────────────────────────────────────────────────────
  faviconFile      = signal<File | null>(null);
  faviconPreview   = signal<string | null>(null);
  faviconUploading = signal(false);
  faviconSuccess   = signal('');
  faviconError     = signal('');

  // ── Logo handlers ───────────────────────────────────────────────────────

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.logoFile.set(file);
    this.logoSuccess.set('');
    this.logoError.set('');
    this.readPreview(file, this.logoPreview);
  }

  uploadLogo(): void {
    const file = this.logoFile();
    if (!file) return;
    this.logoUploading.set(true);
    this.logoSuccess.set('');
    this.logoError.set('');

    this.logoSvc.uploadLogo(file).subscribe({
      next: res => {
        this.logoSvc.setLogo(res.data?.value ?? null);
        this.logoFile.set(null);
        this.logoPreview.set(null);
        this.logoUploading.set(false);
        this.logoSuccess.set('Loqo uğurla yeniləndi!');
      },
      error: err => {
        this.logoUploading.set(false);
        this.logoError.set(err?.error?.message ?? 'Loqo yüklənərkən xəta baş verdi.');
      }
    });
  }

  removeLogo(): void {
    this.logoSvc.setLogo(null);
    this.logoSuccess.set('Loqo silindi.');
  }

  // ── App Name handlers ───────────────────────────────────────────────────

  saveAppName(): void {
    const name = this.appNameInput.trim();
    if (!name) return;
    this.appNameSaving.set(true);
    this.appNameSuccess.set('');
    this.appNameError.set('');

    this.brandingSvc.updateAppName(name).subscribe({
      next: res => {
        this.brandingSvc.setAppName(res.data?.value ?? name);
        this.appNameInput = '';
        this.appNameSaving.set(false);
        this.appNameSuccess.set('Tətbiq adı uğurla yeniləndi!');
      },
      error: err => {
        this.appNameSaving.set(false);
        this.appNameError.set(err?.error?.message ?? 'Xəta baş verdi.');
      }
    });
  }

  // ── Favicon handlers ────────────────────────────────────────────────────

  onFaviconSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.faviconFile.set(file);
    this.faviconSuccess.set('');
    this.faviconError.set('');
    this.readPreview(file, this.faviconPreview);
  }

  uploadFavicon(): void {
    const file = this.faviconFile();
    if (!file) return;
    this.faviconUploading.set(true);
    this.faviconSuccess.set('');
    this.faviconError.set('');

    this.brandingSvc.uploadFavicon(file).subscribe({
      next: res => {
        const url = res.data?.value ?? null;
        this.brandingSvc.setFavicon(url);
        this.faviconFile.set(null);
        this.faviconPreview.set(null);
        this.faviconUploading.set(false);
        this.faviconSuccess.set('Favicon uğurla yeniləndi!');
      },
      error: err => {
        this.faviconUploading.set(false);
        this.faviconError.set(err?.error?.message ?? 'Favicon yüklənərkən xəta baş verdi.');
      }
    });
  }

  // ── Discount Limit handler ──────────────────────────────────────────────

  saveDiscountLimit(): void {
    const limit = Number(this.discountLimitInput);
    if (!limit || limit < 1) return;
    this.limitSaving.set(true);
    this.limitSuccess.set('');
    this.limitError.set('');

    this.homepageSvc.updateDiscountLimit(limit).subscribe({
      next: () => {
        this.homepageSvc.setLimit(limit);
        this.discountLimitInput = 0;
        this.limitSaving.set(false);
        this.limitSuccess.set('Limit uğurla yeniləndi!');
      },
      error: err => {
        this.limitSaving.set(false);
        this.limitError.set(err?.error?.message ?? 'Xəta baş verdi.');
      }
    });
  }

  // ── Password handlers ───────────────────────────────────────────────────

  onChangePwd(): void {
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }
    this.pwdSubmitting.set(true);
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
        this.pwdSubmitting.set(false);
      },
      error: err => {
        this.pwdError.set(err?.error?.message ?? 'Xəta baş verdi');
        this.pwdSubmitting.set(false);
      }
    });
  }

  pwdHasError(field: string, code = ''): boolean {
    const ctrl = this.pwdForm.get(field);
    if (!ctrl?.touched) return false;
    return code ? ctrl.hasError(code) : ctrl.invalid;
  }

  get pwdMismatch(): boolean {
    return !!(this.pwdForm.get('confirmPassword')?.touched && this.pwdForm.hasError('passwordsMismatch'));
  }

  resetPwdForm(): void {
    this.pwdForm.reset();
    this.pwdSuccess.set('');
    this.pwdError.set('');
  }

  // ── Shared ──────────────────────────────────────────────────────────────

  private readPreview(file: File | null, target: ReturnType<typeof signal<string | null>>): void {
    if (!file) { target.set(null); return; }
    const reader = new FileReader();
    reader.onload = e => target.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }
}
