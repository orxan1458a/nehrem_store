import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LogoResponse {
  data: { key: string; value: string | null; updatedAt: string | null };
}

@Injectable({ providedIn: 'root' })
export class LogoService {
  private http = inject(HttpClient);
  private base  = `${environment.apiUrl}/settings`;

  logo$ = new BehaviorSubject<string | null>(null);

  /** Call once on app start to hydrate the logo from the backend. */
  loadLogo(): void {
    this.http.get<LogoResponse>(`${this.base}/logo`).subscribe({
      next: res => this.logo$.next(res.data?.value ?? null),
      error: () => this.logo$.next(null)
    });
  }

  /** Upload a new logo file. Emits the new URL into logo$ on success. */
  uploadLogo(file: File): Observable<LogoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<LogoResponse>(`${this.base}/logo/upload`, formData);
  }

  /** Set logo URL directly in the subject (after admin upload). */
  setLogo(url: string | null): void {
    this.logo$.next(url);
  }

  /** Returns an absolute, cache-busted logo URL. */
  bustUrl(url: string): string {
    const absolute = url.startsWith('http') ? url : `http://localhost:8080${url}`;
    return `${absolute}?v=${Date.now()}`;
  }
}
