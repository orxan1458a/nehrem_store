import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, map } from 'rxjs';
import { ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalVisitors: number;
  activeVisitors: number;
  todayVisitors: number;
  totalOrders: number;
  totalProducts: number;
}

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/visitors`;

  private deviceId = this.getOrCreateDeviceId();

  ping(): void {
    const send = () =>
      this.http.post<ApiResponse<void>>(`${this.base}/ping`, { deviceId: this.deviceId })
        .subscribe({ error: () => {} });

    send();
    interval(3 * 60 * 1000).subscribe(() => send());
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.base}/stats`)
      .pipe(map(r => r.data));
  }

  private getOrCreateDeviceId(): string {
    const key = 'nhm_device_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  }
}
