import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category, CategoryRequest } from '../models/category.model';
import { ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/categories`;

  getAll(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.base)
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  create(req: CategoryRequest): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.base, req)
      .pipe(map(r => r.data));
  }

  update(id: number, req: CategoryRequest): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(`${this.base}/${id}`, req)
      .pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }
}
