import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  /** Current search query (shared across header + shop) */
  readonly query = signal('');

  /** Emits whenever the query changes (for debounced subscriptions) */
  readonly changes$ = new Subject<string>();

  set(value: string): void {
    this.query.set(value);
    this.changes$.next(value);
  }

  clear(): void {
    this.set('');
  }
}
