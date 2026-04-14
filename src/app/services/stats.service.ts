// ═══════════════════════════════════════════════════════════
// stats.service.ts — Operation Statistics API Service
// ═══════════════════════════════════════════════════════════
// Uses forkJoin (RxJS) for concurrent API requests — the
// Angular equivalent of Promise.allSettled().
// ═══════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { STAT_OPERATIONS } from '../data/units';

export interface StatResult {
  op: string;
  count: number;
  ok: boolean;
  msg?: string;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /** GET /Quantity/count/{op} — Fetch count for one operation */
  getOperationCount(operation: string): Observable<number> {
    return this.http.get<any>(
      `${this.baseUrl}/Quantity/count/${operation}`
    ).pipe(
      map(response => response?.data ?? response?.Data ?? 0),
      catchError(() => of(0))
    );
  }

  /**
   * Fetch all operation counts concurrently using forkJoin.
   * forkJoin waits for all Observables to complete and
   * emits an array of their last values — similar to
   * Promise.all() but for Observables.
   * Each individual request catches its own errors so one
   * failure doesn't cancel the others.
   */
  getAllCounts(): Observable<StatResult[]> {
    const requests = STAT_OPERATIONS.map(({ op }) =>
      this.http.get<any>(`${this.baseUrl}/Quantity/count/${op}`).pipe(
        map(response => ({
          op,
          count: response?.data ?? response?.Data ?? 0,
          ok: true
        } as StatResult)),
        catchError(err => of({
          op,
          count: 0,
          ok: false,
          msg: err?.error?.message || 'Failed'
        } as StatResult))
      )
    );

    return forkJoin(requests);
  }
}
