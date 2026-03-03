export type DeliveryMethod = 'DELIVERY' | 'PICKUP';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  firstName: string;
  lastName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  notes?: string;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  items: OrderItemResponse[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
