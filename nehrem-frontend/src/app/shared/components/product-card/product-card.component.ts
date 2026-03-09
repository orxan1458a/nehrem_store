import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() cardClick = new EventEmitter<Product>();
  @Output() editClick = new EventEmitter<Product>();

  auth        = inject(AuthService);
  wishlistSvc = inject(WishlistService);

  get isWishlisted(): boolean {
    return this.wishlistSvc.isWishlisted(this.product.id);
  }

  onHeartClick(): void {
    this.wishlistSvc.toggle(this.product);
  }

  get effectivePrice(): number {
    return this.product.discountPrice ?? this.product.price;
  }

  get hasDiscount(): boolean {
    return !!this.product.discountPrice && this.product.discountPrice < this.product.price;
  }

  get discountPercent(): number {
    if (!this.hasDiscount) return 0;
    return Math.round((1 - this.product.discountPrice! / this.product.price) * 100);
  }

  get isOutOfStock(): boolean {
    return this.product.stockQuantity <= 0;
  }

  onAddToCart(): void {
    if (!this.isOutOfStock) this.addToCart.emit(this.product);
  }

  onCardClick(): void {
    this.cardClick.emit(this.product);
  }
}
