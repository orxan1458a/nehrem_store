import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'admin' | 'courier' | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly ROLE_KEY         = 'nh_role';
  private readonly COURIER_ID_KEY   = 'nh_courier_id';
  private readonly COURIER_NAME_KEY = 'nh_courier_name';

  private _role        = signal<Role>(this.loadRole());
  private _courierId   = signal<number | null>(this.loadCourierId());
  private _courierName = signal<string | null>(localStorage.getItem(this.COURIER_NAME_KEY));

  readonly role        = this._role.asReadonly();
  readonly courierId   = this._courierId.asReadonly();
  readonly courierName = this._courierName.asReadonly();
  readonly isAdmin     = computed(() => this._role() === 'admin');
  readonly isCourier   = computed(() => this._role() === 'courier');

  /** Admin login (local credentials check). */
  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'Nehrem4200!') {
      this._role.set('admin');
      localStorage.setItem(this.ROLE_KEY, 'admin');
      return true;
    }
    return false;
  }

  /** Courier login via backend. Returns Observable<boolean>. */
  courierLoginRequest(username: string, password: string): Observable<boolean> {
    return this.http
      .post<{ success: boolean; data: { id: number; name: string } }>(
        `${environment.apiUrl}/courier/login`,
        { username, password }
      )
      .pipe(
        map(res => {
          this._role.set('courier');
          this._courierId.set(res.data.id);
          this._courierName.set(res.data.name);
          localStorage.setItem(this.ROLE_KEY,         'courier');
          localStorage.setItem(this.COURIER_ID_KEY,   String(res.data.id));
          localStorage.setItem(this.COURIER_NAME_KEY, res.data.name);
          return true;
        })
      );
  }

  logout(): void {
    this._role.set(null);
    this._courierId.set(null);
    this._courierName.set(null);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.COURIER_ID_KEY);
    localStorage.removeItem(this.COURIER_NAME_KEY);
  }

  private loadRole(): Role {
    const stored = localStorage.getItem(this.ROLE_KEY);
    if (stored === 'admin')   return 'admin';
    if (stored === 'courier') return 'courier';
    return null;
  }

  private loadCourierId(): number | null {
    const raw = localStorage.getItem(this.COURIER_ID_KEY);
    return raw ? Number(raw) : null;
  }
}
