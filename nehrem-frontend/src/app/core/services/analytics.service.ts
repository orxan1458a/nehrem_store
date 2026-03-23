import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

export interface AnalyticsStats {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  totalCOGS: number;
  totalProfit: number;
  inventoryValue: number;
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

export interface ProfitPoint {
  label: string;
  revenue: number;
  cogs: number;
  profit: number;
}

export interface ChartData {
  ordersByDate: DataPoint[];
  revenueByDate: DataPoint[];
  orderStatus: StatusCount[];
  topProducts: ProductSale[];
  profitByDate: ProfitPoint[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/dashboard`;

  getStats(): Observable<AnalyticsStats> {
    return this.http.get<ApiResponse<AnalyticsStats>>(`${this.base}/stats`)
      .pipe(map(r => r.data));
  }

  getChartData(days = 30, startDate?: string, endDate?: string): Observable<ChartData> {
    const params: Record<string, string | number> = startDate && endDate
      ? { startDate, endDate }
      : { days };
    return this.http.get<ApiResponse<ChartData>>(`${this.base}/charts`, { params })
      .pipe(map(r => r.data));
  }
}
