export type DeliveryMethod = 'DELIVERY' | 'PICKUP';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'DELIVERED' | 'CANCELLED';

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

export interface CourierInfo {
  id: number;
  name: string;
  phone: string;
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
  courier?: CourierInfo;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
