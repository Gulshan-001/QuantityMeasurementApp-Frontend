// ═══════════════════════════════════════════════════════════
// history.service.ts — Operation History API Service
// ═══════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HistoryItem } from '../models/history.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /** GET /Quantity/history — Fetch all operation history */
  getHistory(): Observable<HistoryItem[]> {
    return this.http.get<any>(`${this.baseUrl}/Quantity/history`).pipe(
      map(response => this.extractItems(response)),
      catchError(this.handleError)
    );
  }

  /** GET /Quantity/history/operation/{op} — Fetch filtered history */
  getHistoryByOperation(operation: string): Observable<HistoryItem[]> {
    return this.http.get<any>(
      `${this.baseUrl}/Quantity/history/operation/${operation}`
    ).pipe(
      map(response => this.extractItems(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Extracts the array from whatever wrapper the backend sends.
   * Handles: raw array, { data: [] }, { Data: [] }, { $values: [] }
   * and { data: { $values: [] } }
   */
  private extractItems(response: any): HistoryItem[] {
    let raw: any[] = [];

    if (Array.isArray(response)) {
      raw = response;
    } else if (Array.isArray(response?.data)) {
      raw = response.data;
    } else if (Array.isArray(response?.Data)) {
      raw = response.Data;
    } else if (Array.isArray(response?.data?.$values)) {
      raw = response.data.$values;
    } else if (Array.isArray(response?.Data?.$values)) {
      raw = response.Data.$values;
    } else if (Array.isArray(response?.$values)) {
      raw = response.$values;
    }

    return raw.map(item => this.normalizeItem(item));
  }

  /**
   * Maps the real backend response to HistoryItem.
   * Backend returns: { operationType, inputType, inputData, resultData, createdAt, ... }
   */
  private normalizeItem(raw: any): HistoryItem {
    return {
      id:            raw.id            ?? raw.Id,
      operationType: raw.operationType ?? raw.OperationType ?? raw.operation ?? raw.Operation ?? '',
      operationCode: raw.operationCode ?? raw.OperationCode,
      inputType:     raw.inputType     ?? raw.InputType     ?? raw.measurementType ?? raw.MeasurementType ?? '',
      outputType:    raw.outputType    ?? raw.OutputType    ?? '',
      inputData:     raw.inputData     ?? raw.InputData     ?? '',
      resultData:    raw.resultData    ?? raw.ResultData    ?? '',
      isSuccess:     raw.isSuccess     ?? raw.IsSuccess     ?? true,
      errorMessage:  raw.errorMessage  ?? raw.ErrorMessage  ?? '',
      createdAt:     raw.createdAt     ?? raw.CreatedAt     ?? '',
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.message || error.error?.Message || 'Failed to load history.';
    console.error('[HistoryService] Error:', error);
    return throwError(() => new Error(message));
  }
}
