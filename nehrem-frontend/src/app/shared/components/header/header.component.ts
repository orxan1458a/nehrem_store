import { Component, HostListener, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService }   from '../../../core/services/cart.service';
import { AuthService }   from '../../../core/services/auth.service';
import { SearchService } from '../../../core/services/search.service';
import { LogoService }     from '../../../core/services/logo.service';
import { BrandingService } from '../../../core/services/branding.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  cart      = inject(CartService);
  auth      = inject(AuthService);
  searchSvc = inject(SearchService);
  logoSvc     = inject(LogoService);
  brandingSvc = inject(BrandingService);
  private router = inject(Router);

  isScrolled = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('window:resize', [])
  onResize(): void {
    if (window.innerWidth >= 1024 && this.menuOpen()) {
      this.closeMenu();
    }
  }

  menuOpen = signal(false);

  toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    document.body.style.overflow = next ? 'hidden' : '';
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    document.body.style.overflow = '';
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
