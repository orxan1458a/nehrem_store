import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OrderRequest, OrderResponse, OrderStatus, CourierInfo, ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/orders`;
  private adminBase = `${environment.apiUrl}/admin`;

  create(req: OrderRequest): Observable<OrderResponse> {
    return this.http.post<ApiResponse<OrderResponse>>(this.base, req)
      .pipe(map(r => r.data));
  }

  getAll(page = 0, size = 20, status?: OrderStatus): Observable<any> {
    const params: Record<string, string | number> = { page, size };
    if (status) params['status'] = status;
    return this.http.get<ApiResponse<any>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<OrderResponse> {
    return this.http.get<ApiResponse<OrderResponse>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  updateStatus(id: number, orderStatus: OrderStatus): Observable<OrderResponse> {
    return this.http.patch<ApiResponse<OrderResponse>>(
      `${this.adminBase}/orders/${id}/status`, { orderStatus }
    ).pipe(map(r => r.data));
  }

  acceptOrder(id: number, courierId: number | null): Observable<OrderResponse> {
    const body = courierId != null ? { courierId } : {};
    return this.http.put<ApiResponse<OrderResponse>>(
      `${this.adminBase}/orders/${id}/accept`, body
    ).pipe(map(r => r.data));
  }

  cancelOrder(id: number): Observable<OrderResponse> {
    return this.http.put<ApiResponse<OrderResponse>>(
      `${this.adminBase}/orders/${id}/cancel`, {}
    ).pipe(map(r => r.data));
  }

  assignCourier(id: number, courierId: number | null): Observable<OrderResponse> {
    return this.http.patch<ApiResponse<OrderResponse>>(
      `${this.adminBase}/orders/${id}/assign-courier`, { courierId }
    ).pipe(map(r => r.data));
  }

  getActiveCouriers(): Observable<CourierInfo[]> {
    return this.http.get<ApiResponse<CourierInfo[]>>(`${this.adminBase}/couriers`)
      .pipe(map(r => r.data));
  }

  getCourierOrders(courierId: number, page = 0, size = 20): Observable<any> {
    return this.http.get<ApiResponse<any>>(
      `${environment.apiUrl}/courier/orders`,
      { params: { courierId, page, size } }
    ).pipe(map(r => r.data));
  }

  markDelivered(orderId: number, courierId: number): Observable<OrderResponse> {
    return this.http.patch<ApiResponse<OrderResponse>>(
      `${environment.apiUrl}/courier/orders/${orderId}/delivered`,
      { courierId }
    ).pipe(map(r => r.data));
  }
}
