import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav">
      <a routerLink="/shop" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="bottom-nav__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Əsas</span>
      </a>

      <a routerLink="/shop" routerLinkActive="active" class="bottom-nav__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Kəşf et</span>
      </a>

      <a routerLink="/cart" routerLinkActive="active" class="bottom-nav__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span>Sifarişlər</span>
      </a>

      @if (auth.isAdmin()) {
        <a routerLink="/admin" routerLinkActive="active" class="bottom-nav__item bottom-nav__item--admin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Admin</span>
        </a>
      } @else {
        <a routerLink="/login" routerLinkActive="active" class="bottom-nav__item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span>Daxil ol</span>
        </a>
      }
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 72px;
      background: #fff;
      border-top: 1px solid #ebebeb;
      display: flex;
      align-items: center;
      justify-content: space-around;
      z-index: 900;
      padding: 0 .5rem;
    }

    .bottom-nav__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      color: #aaa;
      text-decoration: none;
      font-size: .65rem;
      font-weight: 500;
      padding: .4rem .75rem;
      transition: color .15s;
      min-width: 56px;

      svg {
        width: 22px;
        height: 22px;
        stroke: currentColor;
      }

      span { line-height: 1; }

      &.active { color: #00BFA5; }

      &--admin.active { color: #00897B; }
    }
  `]
})
export class FooterComponent {
  auth = inject(AuthService);
}
