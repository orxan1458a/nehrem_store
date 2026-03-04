import { Injectable, signal, computed } from '@angular/core';

export type Role = 'admin' | 'guest';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'nh_role';

  private _role = signal<Role | null>(this.loadRole());

  readonly role    = this._role.asReadonly();
  readonly isAdmin = computed(() => this._role() === 'admin');
  readonly isGuest = computed(() => this._role() === null);

  /** Returns true if credentials are valid. */
  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'Nehrem4200!') {
      this._role.set('admin');
      localStorage.setItem(this.STORAGE_KEY, 'admin');
      return true;
    }
    return false;
  }

  logout(): void {
    this._role.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadRole(): Role | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored === 'admin' ? 'admin' : null;
  }
}
