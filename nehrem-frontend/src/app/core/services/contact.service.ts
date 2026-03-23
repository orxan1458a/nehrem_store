import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ContactSettings {
  phone:            string | null;
  phoneVisible:     boolean;
  email:            string | null;
  emailVisible:     boolean;
  tiktok:           string | null;
  tiktokVisible:    boolean;
  instagram:        string | null;
  instagramVisible: boolean;
  telegram:         string | null;
  telegramVisible:  boolean;
}

interface ContactResponse {
  data: ContactSettings;
}

const DEFAULT: ContactSettings = {
  phone: null, phoneVisible: true,
  email: null, emailVisible: true,
  tiktok: null, tiktokVisible: true,
  instagram: null, instagramVisible: true,
  telegram: null, telegramVisible: true,
};

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/settings/contact`;

  readonly contact$ = new BehaviorSubject<ContactSettings>(DEFAULT);

  load(): void {
    this.http.get<ContactResponse>(this.base).subscribe({
      next: res => this.contact$.next(res.data),
      error: () => {}
    });
  }

  get(): Observable<ContactResponse> {
    return this.http.get<ContactResponse>(this.base);
  }

  update(dto: ContactSettings): Observable<ContactResponse> {
    return this.http.put<ContactResponse>(this.base, dto).pipe(
      tap(res => this.contact$.next(res.data))
    );
  }
}
