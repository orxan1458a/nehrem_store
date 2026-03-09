import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService }   from '../../../core/services/cart.service';
import { AuthService }   from '../../../core/services/auth.service';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  cart      = inject(CartService);
  auth      = inject(AuthService);
  searchSvc = inject(SearchService);
  private router = inject(Router);

  menuOpen = signal(false);

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void  { this.menuOpen.set(false); }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSvc.set(value);
    this.router.navigate(['/shop']);
  }

  clearSearch(): void {
    this.searchSvc.clear();
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
  }
}
