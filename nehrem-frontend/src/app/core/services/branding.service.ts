import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface SettingResponse {
  data: { key: string; value: string | null };
}

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private http  = inject(HttpClient);
  private title = inject(Title);
  private base  = `${environment.apiUrl}/settings`;

  readonly DEFAULT_APP_NAME = 'EvTrend';

  appName$ = new BehaviorSubject<string>(this.DEFAULT_APP_NAME);
  favicon$ = new BehaviorSubject<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  loadAppName(): void {
    this.http.get<SettingResponse>(`${this.base}/app-name`).subscribe({
      next: res => {
        const name = res.data?.value || this.DEFAULT_APP_NAME;
        this.appName$.next(name);
        this.title.setTitle(name);
      },
      error: () => {}
    });
  }

  loadFavicon(): void {
    this.http.get<SettingResponse>(`${this.base}/favicon`).subscribe({
      next: res => {
        const url = res.data?.value ?? null;
        this.favicon$.next(url);
        if (url) this.applyFavicon(url);
      },
      error: () => {}
    });
  }

  // ── Update ────────────────────────────────────────────────────────────────

  updateAppName(name: string): Observable<SettingResponse> {
    return this.http.put<SettingResponse>(`${this.base}/app-name`, { value: name });
  }

  uploadFavicon(file: File): Observable<SettingResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<SettingResponse>(`${this.base}/favicon/upload`, formData);
  }

  setAppName(name: string): void {
    this.appName$.next(name);
    this.title.setTitle(name);
  }

  setFavicon(url: string | null): void {
    this.favicon$.next(url);
    if (url) this.applyFavicon(url);
  }

  // ── DOM ───────────────────────────────────────────────────────────────────

  private applyFavicon(url: string): void {
    const absolute = url.startsWith('http') ? url : `http://localhost:8080${url}`;
    const href = `${absolute}?v=${Date.now()}`;

    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      document.head.appendChild(link);
    }
    link.type = 'image/x-icon';
    link.rel  = 'shortcut icon';
    link.href = href;
  }
}
