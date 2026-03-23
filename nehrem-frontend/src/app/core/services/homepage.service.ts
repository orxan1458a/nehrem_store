import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

interface HomepageSettingsResponse {
  data: { homepageDiscountLimit: number };
}

@Injectable({ providedIn: 'root' })
export class HomepageService {
  private http = inject(HttpClient);
  private base  = `${environment.apiUrl}/settings`;

  readonly DEFAULT_LIMIT = 5;

  homepageDiscountLimit$ = new BehaviorSubject<number>(this.DEFAULT_LIMIT);

  loadHomepageSettings(): void {
    this.http.get<HomepageSettingsResponse>(`${this.base}/homepage`).subscribe({
      next: res => {
        const limit = res.data?.homepageDiscountLimit ?? this.DEFAULT_LIMIT;
        this.homepageDiscountLimit$.next(limit > 0 ? limit : this.DEFAULT_LIMIT);
      },
      error: () => {}
    });
  }

  updateDiscountLimit(limit: number) {
    return this.http.put(`${this.base}/homepage/discount-limit`, { value: limit });
  }

  setLimit(limit: number): void {
    this.homepageDiscountLimit$.next(limit);
  }
}
