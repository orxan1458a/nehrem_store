import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

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

      <a routerLink="/wishlist" routerLinkActive="active" class="bottom-nav__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>Seçilmişlər</span>
      </a>

      <a routerLink="/cart" routerLinkActive="active" class="bottom-nav__item cart-nav">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        @if (cart.count() > 0) {
          <span class="cart-badge">{{ cart.count() }}</span>
        }
        <span>Səbət</span>
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

    .cart-nav {
      position: relative;
    }

    .cart-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #00BFA5;
      color: #fff;
      border-radius: 999px;
      font-size: .6rem;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      line-height: 1;
    }
  `]
})
export class FooterComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
}
