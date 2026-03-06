export interface Category {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  createdAt?: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}
