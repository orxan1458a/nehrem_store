import { Component, OnInit, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { LogoService }     from '../../../core/services/logo.service';
import { BrandingService } from '../../../core/services/branding.service';
import { HomepageService } from '../../../core/services/homepage.service';
import { UserService }     from '../../../core/services/user.service';
import { ContactService, ContactSettings } from '../../../core/services/contact.service';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const np = group.get('newPassword')?.value;
  const cp = group.get('confirmPassword')?.value;
  return np && cp && np !== cp ? { passwordsMismatch: true } : null;
}

function optionalPhone(ctrl: AbstractControl): ValidationErrors | null {
  const v = ctrl.value;
  if (!v) return null;
  return /^\+?[0-9\s\-\(\)]{7,20}$/.test(v) ? null : { phone: true };
}

function optionalEmail(ctrl: AbstractControl): ValidationErrors | null {
  const v = ctrl.value;
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : { email: true };
}

function optionalUrl(ctrl: AbstractControl): ValidationErrors | null {
  const v = ctrl.value;
  if (!v) return null;
  try { new URL(v); return null; }
  catch { return { url: true }; }
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

      <!-- ── Contact & Social ───────────────────────────────────────────── -->
      <div class="settings-card">
        <h2 class="settings-card__heading">Əlaqə və Sosial Media</h2>

        @if (contactSuccess()) { <div class="alert alert--success">{{ contactSuccess() }}</div> }
        @if (contactError())   { <div class="alert alert--error">{{ contactError() }}</div> }

        <form [formGroup]="contactGroup" class="contact-form" (ngSubmit)="saveContact()">

          <!-- Phone -->
          <div class="contact-row">
            <div class="contact-row__info">
              <span class="contact-row__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.45 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <span class="contact-row__label">Telefon</span>
            </div>
            <div class="contact-row__body">
              <input class="text-input" type="tel" formControlName="phone"
                     placeholder="+994 51 747 69 10"
                     [class.input--error]="cErr('phone')" />
              @if (cErr('phone')) {
                <span class="field-err">Düzgün telefon nömrəsi daxil edin</span>
              }
            </div>
            <label class="toggle" title="Saytda göstər">
              <input type="checkbox" formControlName="phoneVisible" />
            </label>
          </div>

          <!-- Email -->
          <div class="contact-row">
            <div class="contact-row__info">
              <span class="contact-row__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <span class="contact-row__label">E-poçt</span>
            </div>
            <div class="contact-row__body">
              <input class="text-input" type="email" formControlName="email"
                     placeholder="info@evtrend.az"
                     [class.input--error]="cErr('email')" />
              @if (cErr('email')) {
                <span class="field-err">Düzgün e-poçt ünvanı daxil edin</span>
              }
            </div>
            <label class="toggle" title="Saytda göstər">
              <input type="checkbox" formControlName="emailVisible" />
            </label>
          </div>

          <!-- TikTok -->
          <div class="contact-row">
            <div class="contact-row__info">
              <span class="contact-row__icon contact-row__icon--tiktok">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                </svg>
              </span>
              <span class="contact-row__label">TikTok</span>
            </div>
            <div class="contact-row__body">
              <input class="text-input" type="url" formControlName="tiktok"
                     placeholder="https://tiktok.com/@profil"
                     [class.input--error]="cErr('tiktok')" />
              @if (cErr('tiktok')) {
                <span class="field-err">Düzgün URL daxil edin (https://...)</span>
              }
            </div>
            <label class="toggle" title="Saytda göstər">
              <input type="checkbox" formControlName="tiktokVisible" />
            </label>
          </div>

          <!-- Instagram -->
          <div class="contact-row">
            <div class="contact-row__info">
              <span class="contact-row__icon contact-row__icon--instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </span>
              <span class="contact-row__label">Instagram</span>
            </div>
            <div class="contact-row__body">
              <input class="text-input" type="url" formControlName="instagram"
                     placeholder="https://instagram.com/profil"
                     [class.input--error]="cErr('instagram')" />
              @if (cErr('instagram')) {
                <span class="field-err">Düzgün URL daxil edin (https://...)</span>
              }
            </div>
            <label class="toggle" title="Saytda göstər">
              <input type="checkbox" formControlName="instagramVisible" />
            </label>
          </div>

          <!-- Telegram -->
          <div class="contact-row">
            <div class="contact-row__info">
              <span class="contact-row__icon contact-row__icon--telegram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.88 14.07l-2.948-.924c-.64-.203-.654-.64.136-.947l11.527-4.448c.534-.194 1.001.13.967.497z"/>
                </svg>
              </span>
              <span class="contact-row__label">Telegram</span>
            </div>
            <div class="contact-row__body">
              <input class="text-input" type="url" formControlName="telegram"
                     placeholder="https://t.me/kanal"
                     [class.input--error]="cErr('telegram')" />
              @if (cErr('telegram')) {
                <span class="field-err">Düzgün URL daxil edin (https://...)</span>
              }
            </div>
            <label class="toggle" title="Saytda göstər">
              <input type="checkbox" formControlName="telegramVisible" />
            </label>
          </div>

        </form>

        <div class="contact-save">
          <button class="btn btn--primary"
                  [disabled]="contactGroup.invalid || contactSaving()"
                  (click)="saveContact()">
            @if (contactSaving()) { <span class="spinner"></span> Saxlanılır... }
            @else { Saxla }
          </button>
        </div>
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

    /* Contact form */
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: .65rem;
      margin-bottom: 1rem;
    }
    .contact-row {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      align-items: start;
      gap: .75rem;
      padding: .6rem .75rem;
      border-radius: 10px;
      background: #fafafa;
      border: 1px solid #f0f0f0;
    }
    .contact-row__info {
      display: flex;
      align-items: center;
      gap: .45rem;
      padding-top: .55rem;
    }
    .contact-row__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px; height: 28px;
      border-radius: 7px;
      background: #e0f7f4;
      color: #00897B;
      flex-shrink: 0;
      &--tiktok    { background: #f0f0f0; color: #1a1a1a; }
      &--instagram { background: #fce4ec; color: #c2185b; }
      &--telegram  { background: #e3f2fd; color: #1565c0; }
    }
    .contact-row__label {
      font-size: .82rem;
      font-weight: 600;
      color: #444;
      white-space: nowrap;
    }
    .contact-row__body {
      display: flex;
      flex-direction: column;
      gap: .2rem;
    }
    .input--error { border-color: #e63946 !important; }
    /* Toggle switch */
    .toggle {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      padding-top: .55rem;
      flex-shrink: 0;
    }
    .contact-save {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  logoSvc     = inject(LogoService);
  brandingSvc = inject(BrandingService);
  homepageSvc = inject(HomepageService);
  private userSvc    = inject(UserService);
  private fb         = inject(FormBuilder);
  private contactSvc = inject(ContactService);

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

  // ── Contact / Social state ──────────────────────────────────────────────
  contactSaving  = signal(false);
  contactSuccess = signal('');
  contactError   = signal('');

  contactGroup = this.fb.group({
    phone:            ['', optionalPhone],
    phoneVisible:     [true],
    email:            ['', optionalEmail],
    emailVisible:     [true],
    tiktok:           ['', optionalUrl],
    tiktokVisible:    [true],
    instagram:        ['', optionalUrl],
    instagramVisible: [true],
    telegram:         ['', optionalUrl],
    telegramVisible:  [true],
  });

  // ── Logo handlers ───────────────────────────────────────────────────────

  ngOnInit(): void {
    this.contactSvc.get().subscribe({
      next: res => {
        const d = res.data;
        this.contactGroup.patchValue({
          phone:            d.phone     ?? '',
          phoneVisible:     d.phoneVisible,
          email:            d.email     ?? '',
          emailVisible:     d.emailVisible,
          tiktok:           d.tiktok    ?? '',
          tiktokVisible:    d.tiktokVisible,
          instagram:        d.instagram ?? '',
          instagramVisible: d.instagramVisible,
          telegram:         d.telegram  ?? '',
          telegramVisible:  d.telegramVisible,
        });
      },
      error: () => {}
    });
  }

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

  // ── Contact handlers ────────────────────────────────────────────────────

  saveContact(): void {
    if (this.contactGroup.invalid) { this.contactGroup.markAllAsTouched(); return; }
    this.contactSaving.set(true);
    this.contactSuccess.set('');
    this.contactError.set('');
    const v = this.contactGroup.getRawValue();
    this.contactSvc.update({
      phone:            v.phone     || null,
      phoneVisible:     v.phoneVisible ?? true,
      email:            v.email     || null,
      emailVisible:     v.emailVisible ?? true,
      tiktok:           v.tiktok    || null,
      tiktokVisible:    v.tiktokVisible ?? true,
      instagram:        v.instagram || null,
      instagramVisible: v.instagramVisible ?? true,
      telegram:         v.telegram  || null,
      telegramVisible:  v.telegramVisible ?? true,
    }).subscribe({
      next: () => {
        this.contactSaving.set(false);
        this.contactSuccess.set('Əlaqə məlumatları uğurla saxlanıldı!');
      },
      error: err => {
        this.contactSaving.set(false);
        this.contactError.set(err?.error?.message ?? 'Xəta baş verdi.');
      }
    });
  }

  cErr(field: string): boolean {
    const ctrl = this.contactGroup.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
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
