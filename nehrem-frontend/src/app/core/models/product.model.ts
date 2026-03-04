export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  active: boolean;
  createdAt?: string;
  reviewCount?: number;
  averageRating?: number;
  viewCount?: number;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  categoryId?: number;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
