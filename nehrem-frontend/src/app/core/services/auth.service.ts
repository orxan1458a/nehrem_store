import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'ADMIN' | 'COURIER' | null;

export interface JwtPayload {
  userId:   number;
  username: string;
  role:     Role;
  name:     string | null;
}

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    role:        string;
    userId:      number;
    username:    string;
    name:        string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly TOKEN_KEY = 'nh_token';

  private _user = signal<JwtPayload | null>(this.loadUser());

  readonly isAdmin   = computed(() => this._user()?.role === 'ADMIN');
  readonly isCourier = computed(() => this._user()?.role === 'COURIER');
  readonly courierId = computed(() => this._user()?.userId ?? null);
  readonly courierName = computed(() => this._user()?.name ?? null);

  login(username: string, password: string): Observable<JwtPayload> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        map(res => {
          localStorage.setItem(this.TOKEN_KEY, res.data.accessToken);
          const payload = this.decodeToken(res.data.accessToken);
          this._user.set(payload);
          return payload;
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._user.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUser(): JwtPayload | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    try {
      return this.decodeToken(token);
    } catch {
      localStorage.removeItem(this.TOKEN_KEY);
      return null;
    }
  }

  private decodeToken(token: string): JwtPayload {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId:   payload['userId'],
      username: payload['sub'],
      role:     payload['role'] as Role,
      name:     payload['name'] ?? null
    };
  }
}
