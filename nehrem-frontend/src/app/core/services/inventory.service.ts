import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/order.model';
import { InventoryBatch, AddBatchRequest } from '../models/inventory.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/inventory`;

  getBatches(productId: number): Observable<InventoryBatch[]> {
    return this.http.get<ApiResponse<InventoryBatch[]>>(`${this.base}/${productId}/batches`)
      .pipe(map(r => r.data));
  }

  addBatch(productId: number, req: AddBatchRequest): Observable<InventoryBatch> {
    return this.http.post<ApiResponse<InventoryBatch>>(`${this.base}/${productId}/batches`, req)
      .pipe(map(r => r.data));
  }
}
