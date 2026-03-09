import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  changePassword(req: ChangePasswordRequest): Observable<string> {
    return this.http
      .post<{ success: boolean; message: string }>(`${this.base}/change-password`, req)
      .pipe(map(r => r.message));
  }
}
