import { Component, inject } from '@angular/core';
import { AsyncPipe }         from '@angular/common';
import { RouterLink }        from '@angular/router';
import { LogoService }       from '../../../core/services/logo.service';
import { BrandingService }   from '../../../core/services/branding.service';
import { ContactService }    from '../../../core/services/contact.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  template: `
    <footer class="site-footer">
      <div class="site-footer__inner">

        <!-- ── Branding ───────────────────────────────────────────── -->
        <div class="site-footer__col site-footer__col--brand">
          <a routerLink="/shop" class="site-footer__logo-link">
            @if (logoSvc.logo$ | async; as logoUrl) {
              <img [src]="logoSvc.bustUrl(logoUrl)" class="site-footer__logo-img" alt="logo" />
            } @else {
              <svg class="site-footer__logo-svg" viewBox="0 0 24 24" fill="none"
                   xmlns="http://www.w3.org/2000/svg">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.29C3.35 19.97 3.7 21 4.5 21C6.5 21 10.5 20 12 17C14 14 14.5 11.5 17 8Z"
                      fill="#00BFA5"/>
                <path d="M17 8C15 10 13 12.5 12 17C14.5 17 16.5 15 17 13C17.5 11 17.5 9.5 17 8Z"
                      fill="#00897B"/>
              </svg>
            }
            <span class="site-footer__app-name">{{ brandingSvc.appName$ | async }}</span>
          </a>
          <p class="site-footer__tagline">
            Keyfiyyətli ev məhsulları, sərfəli qiymətlər, sürətli çatdırılma.
          </p>
        </div>

        <!-- ── Navigation ────────────────────────────────────────── -->
        <div class="site-footer__col">
          <h3 class="site-footer__heading">Keçidlər</h3>
          <ul class="site-footer__list">
            <li><a routerLink="/shop">Ana səhifə</a></li>
            <li><a routerLink="/shop">Məhsullar</a></li>
            <li><a routerLink="/my-orders">Sifarişlərim</a></li>
            <li><a routerLink="/wishlist">Seçilmişlər</a></li>
            <li><a routerLink="/cart">Səbət</a></li>
          </ul>
        </div>

        <!-- ── Contact ────────────────────────────────────────────── -->
        <div class="site-footer__col">
          <h3 class="site-footer__heading">Əlaqə</h3>

          @if (contactSvc.contact$ | async; as c) {
            <ul class="site-footer__list site-footer__list--contact">

              @if (c.phone && c.phoneVisible) {
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.49 2 2 0 0 1 3.55 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.9-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a [href]="'tel:' + c.phone">{{ c.phone }}</a>
              </li>
              }

              @if (c.email && c.emailVisible) {
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a [href]="'mailto:' + c.email">{{ c.email }}</a>
              </li>
              }

            </ul>

            <!-- Social icons -->
            @if ((c.tiktok && c.tiktokVisible) || (c.instagram && c.instagramVisible) || (c.telegram && c.telegramVisible)) {
            <div class="site-footer__socials">

              @if (c.tiktok && c.tiktokVisible) {
              <a [href]="c.tiktok" target="_blank" rel="noopener"
                 class="site-footer__social" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                </svg>
              </a>
              }

              @if (c.instagram && c.instagramVisible) {
              <a [href]="c.instagram" target="_blank" rel="noopener"
                 class="site-footer__social" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              }

              @if (c.telegram && c.telegramVisible) {
              <a [href]="c.telegram" target="_blank" rel="noopener"
                 class="site-footer__social" aria-label="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.88 14.07l-2.948-.924c-.64-.203-.654-.64.136-.947l11.527-4.448c.534-.194 1.001.13.967.497z"/>
                </svg>
              </a>
              }

            </div>
            }
          }

        </div>

      </div>

      <!-- ── Bottom bar ─────────────────────────────────────────── -->
      <div class="site-footer__bottom">
        <p class="site-footer__copy">
          © {{ year }} {{ brandingSvc.appName$ | async }}. Bütün hüquqlar qorunur.
        </p>
        <button class="site-footer__scroll-top" (click)="scrollToTop()" aria-label="Yuxarı qalx">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
          Yuxarı
        </button>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #f4f6f8;
      color: #6b7280;
      font-size: .9rem;
      border-top: 1px solid #e5e7eb;

      /* On mobile, leave room for the fixed bottom nav */
      padding-bottom: 80px;

      @media (min-width: 1024px) {
        padding-bottom: 0;
      }
    }

    .site-footer__inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1.5rem 2rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;

      @media (max-width: 639px) {
        padding: 1.25rem 1rem .75rem;
        gap: 1.25rem;
        grid-template-columns: 1fr 1fr;
      }

      @media (min-width: 640px) {
        grid-template-columns: 1fr 1fr;
      }

      @media (min-width: 1024px) {
        grid-template-columns: 1.6fr 1fr 1fr;
        gap: 3rem;
      }
    }

    /* Branding column — full width on mobile so nav/contact sit side-by-side below */
    .site-footer__col--brand {
      @media (max-width: 639px) {
        grid-column: 1 / -1;
      }
    }

    .site-footer__logo-link {
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      margin-bottom: .85rem;
      text-decoration: none;

      @media (max-width: 639px) {
        margin-bottom: .4rem;
      }
    }
    .site-footer__logo-img,
    .site-footer__logo-svg {
      width: 28px;
      height: 28px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .site-footer__app-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: #1a1a1a;
    }
    .site-footer__tagline {
      color: #9ca3af;
      font-size: .85rem;
      line-height: 1.6;
      max-width: 280px;

      @media (max-width: 639px) {
        display: none;
      }
    }

    /* Section headings */
    .site-footer__heading {
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: #00897B;
      margin-bottom: 1.1rem;

      @media (max-width: 639px) {
        margin-bottom: .5rem;
      }
    }

    /* Link lists */
    .site-footer__list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: .65rem;

      @media (max-width: 639px) {
        gap: .35rem;
        font-size: .82rem;
      }

      a {
        color: #6b7280;
        text-decoration: none;
        transition: color .18s;
        &:hover { color: #00BFA5; }
      }

      &--contact li {
        display: flex;
        align-items: center;
        gap: .55rem;

        svg { flex-shrink: 0; opacity: .5; }
      }
    }

    /* Social icons */
    .site-footer__socials {
      display: flex;
      gap: .75rem;
      margin-top: 1.25rem;

      @media (max-width: 639px) {
        margin-top: .6rem;
        gap: .5rem;
      }
    }
    .site-footer__social {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #e0f7f3;
      color: #00897B;
      text-decoration: none;
      transition: background .18s, color .18s;

      &:hover {
        background: #00BFA5;
        color: #fff;
      }
    }

    /* Bottom bar */
    .site-footer__bottom {
      border-top: 1px solid #e5e7eb;
      background: #fff;
      max-width: 100%;
      margin: 0;
      padding: 1.1rem 1.5rem;

      @media (max-width: 639px) {
        padding: .65rem 1rem;
      }
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: .75rem;
    }
    .site-footer__copy {
      color: #9ca3af;
      font-size: .82rem;
    }
    .site-footer__scroll-top {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      background: #e0f7f3;
      border: none;
      border-radius: 8px;
      color: #00897B;
      font-size: .82rem;
      font-weight: 600;
      padding: .4rem .85rem;
      cursor: pointer;
      transition: background .18s, color .18s;

      &:hover {
        background: #00BFA5;
        color: #fff;
      }
    }
  `]
})
export class SiteFooterComponent {
  logoSvc     = inject(LogoService);
  brandingSvc = inject(BrandingService);
  contactSvc  = inject(ContactService);

  year = new Date().getFullYear();

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
