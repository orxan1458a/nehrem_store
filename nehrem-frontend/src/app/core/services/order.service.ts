import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OrderRequest, OrderResponse, ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/orders`;

  create(req: OrderRequest): Observable<OrderResponse> {
    return this.http.post<ApiResponse<OrderResponse>>(this.base, req)
      .pipe(map(r => r.data));
  }

  getAll(page = 0, size = 20): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.base}?page=${page}&size=${size}`)
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<OrderResponse> {
    return this.http.get<ApiResponse<OrderResponse>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }
}
