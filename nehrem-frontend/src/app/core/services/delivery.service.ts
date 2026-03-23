import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DeliverySettings {
  freeDeliveryThreshold: number;
  deliveryFee: number;
}

interface DeliveryResponse {
  data: DeliverySettings;
}

const DEFAULTS: DeliverySettings = {
  freeDeliveryThreshold: 15,
  deliveryFee: 2,
};

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/settings/delivery`;

  readonly settings = signal<DeliverySettings>({ ...DEFAULTS });

  load(): void {
    this.http.get<DeliveryResponse>(this.base).subscribe({
      next: res => this.settings.set(res.data),
      error: () => {}
    });
  }

  get(): Observable<DeliveryResponse> {
    return this.http.get<DeliveryResponse>(this.base);
  }

  update(dto: DeliverySettings): Observable<DeliveryResponse> {
    return this.http.put<DeliveryResponse>(this.base, dto).pipe(
      tap(res => this.settings.set(res.data))
    );
  }
}
