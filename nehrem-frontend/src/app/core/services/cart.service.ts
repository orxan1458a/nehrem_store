import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items    = this._items.asReadonly();
  readonly count    = computed(() => this._items().reduce((s, i) => s + i.quantity, 0));
  readonly subtotal = computed(() =>
    this._items().reduce((s, i) => {
      const price = i.product.discountPrice ?? i.product.price;
      return s + price * i.quantity;
    }, 0)
  );

  addItem(product: Product, qty = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        return items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stockQuantity) }
            : i
        );
      }
      return [...items, { product, quantity: Math.min(qty, product.stockQuantity) }];
    });
    this.saveToStorage();
  }

  updateQuantity(productId: number, qty: number): void {
    if (qty <= 0) { this.removeItem(productId); return; }
    this._items.update(items =>
      items.map(i =>
        i.product.id === productId
          ? { ...i, quantity: Math.min(qty, i.product.stockQuantity) }
          : i
      )
    );
    this.saveToStorage();
  }

  removeItem(productId: number): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
    this.saveToStorage();
  }

  clear(): void {
    this._items.set([]);
    localStorage.removeItem('nehrem_cart');
  }

  private saveToStorage(): void {
    localStorage.setItem('nehrem_cart', JSON.stringify(this._items()));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem('nehrem_cart');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
