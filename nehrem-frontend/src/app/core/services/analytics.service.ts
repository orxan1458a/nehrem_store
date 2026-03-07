import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

export interface AnalyticsStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface DataPoint {
  label: string;
  value: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface ProductSale {
  name: string;
  quantity: number;
}

export interface ChartData {
  ordersByDate: DataPoint[];
  revenueByDate: DataPoint[];
  orderStatus: StatusCount[];
  topProducts: ProductSale[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/dashboard`;

  getStats(): Observable<AnalyticsStats> {
    return this.http.get<ApiResponse<AnalyticsStats>>(`${this.base}/stats`)
      .pipe(map(r => r.data));
  }

  getChartData(days = 30): Observable<ChartData> {
    return this.http.get<ApiResponse<ChartData>>(`${this.base}/charts`, { params: { days } })
      .pipe(map(r => r.data));
  }
}
