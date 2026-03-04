import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private _items = signal<Product[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  isWishlisted(productId: number): boolean {
    return this._items().some(p => p.id === productId);
  }

  toggle(product: Product): void {
    if (this.isWishlisted(product.id)) {
      this._items.update(items => items.filter(p => p.id !== product.id));
    } else {
      this._items.update(items => [...items, product]);
    }
    this.saveToStorage();
  }

  remove(productId: number): void {
    this._items.update(items => items.filter(p => p.id !== productId));
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem('nehrem_wishlist', JSON.stringify(this._items()));
  }

  private loadFromStorage(): Product[] {
    try {
      const raw = localStorage.getItem('nehrem_wishlist');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
