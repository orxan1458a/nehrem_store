import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';

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
}
