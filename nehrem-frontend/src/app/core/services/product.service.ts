import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, ProductPage, ProductRequest } from '../models/product.model';
import { ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;

  getAll(params: {
    categoryId?: number;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  } = {}): Observable<ProductPage> {
    let httpParams = new HttpParams();
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.search)     httpParams = httpParams.set('search', params.search);
    httpParams = httpParams
      .set('page',    params.page    ?? 0)
      .set('size',    params.size    ?? 12)
      .set('sortBy',  params.sortBy  ?? 'createdAt')
      .set('sortDir', params.sortDir ?? 'desc');

    return this.http.get<ApiResponse<ProductPage>>(this.base, { params: httpParams })
      .pipe(map(r => r.data));
  }

  getAdminAll(params: { search?: string; page?: number; size?: number } = {}): Observable<ProductPage> {
    let httpParams = new HttpParams()
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 10);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<ApiResponse<ProductPage>>(`${this.base}/admin-list`, { params: httpParams })
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  create(req: ProductRequest, image?: File): Observable<Product> {
    const form = this.buildForm(req, image);
    return this.http.post<ApiResponse<Product>>(this.base, form)
      .pipe(map(r => r.data));
  }

  update(id: number, req: ProductRequest, image?: File): Observable<Product> {
    const form = this.buildForm(req, image);
    return this.http.put<ApiResponse<Product>>(`${this.base}/${id}`, form)
      .pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }

  toggleActive(id: number): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/${id}/toggle-active`, {})
      .pipe(map(() => void 0));
  }

  incrementView(id: number): Observable<void> {
    const deviceId = this.getDeviceId();
    return this.http.post<ApiResponse<void>>(`${this.base}/${id}/view`, {}, {
      headers: { 'X-Device-Id': deviceId }
    }).pipe(map(() => void 0));
  }

  private getDeviceId(): string {
    const key = 'nehrem_device_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  }

  private buildForm(req: ProductRequest, image?: File): FormData {
    const form = new FormData();
    form.append('product', new Blob([JSON.stringify(req)], { type: 'application/json' }));
    if (image) form.append('image', image);
    return form;
  }
}
