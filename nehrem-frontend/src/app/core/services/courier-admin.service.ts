import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

export interface CourierResponse {
  id: number;
  name: string;
  phone: string;
  username: string;
  active: boolean;
}

export interface CourierRequest {
  name: string;
  phone: string;
  username: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class CourierAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/couriers`;

  getAll(): Observable<CourierResponse[]> {
    return this.http.get<ApiResponse<CourierResponse[]>>(`${this.base}/all`)
      .pipe(map(r => r.data));
  }

  create(req: CourierRequest): Observable<CourierResponse> {
    return this.http.post<ApiResponse<CourierResponse>>(this.base, req)
      .pipe(map(r => r.data));
  }

  update(id: number, req: CourierRequest): Observable<CourierResponse> {
    return this.http.put<ApiResponse<CourierResponse>>(`${this.base}/${id}`, req)
      .pipe(map(r => r.data));
  }

  toggleActive(id: number): Observable<CourierResponse> {
    return this.http.patch<ApiResponse<CourierResponse>>(`${this.base}/${id}/toggle`, {})
      .pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }
}
