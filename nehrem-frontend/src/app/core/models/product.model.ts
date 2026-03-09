export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  /** ISO date-time when the discount was applied. */
  discountStartDate?: string;
  /** ISO date-time when the discount should expire. Null = indefinite. */
  discountEndDate?: string;
  stockQuantity: number;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  active: boolean;
  createdAt?: string;
  reviewCount?: number;
  averageRating?: number;
  viewCount?: number;
  /** Latest batch purchase price. Admin-only — not displayed on public shop. */
  purchasePrice?: number;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  /** ISO date-time when the discount expires. Null = indefinite. */
  discountEndDate?: string;
  stockQuantity: number;
  categoryId?: number;
  /** Initial batch purchase price — admin only, optional. */
  purchasePrice?: number;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
