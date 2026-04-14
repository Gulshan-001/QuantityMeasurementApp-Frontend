// ═══════════════════════════════════════════════════════════
// calculator.service.ts — Calculation API Service
// ═══════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CalculationRequest, CalculationResponse } from '../models/quantity.model';

@Injectable({ providedIn: 'root' })
export class CalculatorService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /** POST /Quantity/convert */
  convert(body: CalculationRequest): Observable<CalculationResponse> {
    return this.http.post<CalculationResponse>(
      `${this.baseUrl}/Quantity/convert`, body
    ).pipe(catchError(this.handleError));
  }

  /** POST /Quantity/compare */
  compare(body: CalculationRequest): Observable<CalculationResponse> {
    return this.http.post<CalculationResponse>(
      `${this.baseUrl}/Quantity/compare`, body
    ).pipe(catchError(this.handleError));
  }

  /** POST /Quantity/add */
  add(body: CalculationRequest): Observable<CalculationResponse> {
    return this.http.post<CalculationResponse>(
      `${this.baseUrl}/Quantity/add`, body
    ).pipe(catchError(this.handleError));
  }

  /** POST /Quantity/subtract */
  subtract(body: CalculationRequest): Observable<CalculationResponse> {
    return this.http.post<CalculationResponse>(
      `${this.baseUrl}/Quantity/subtract`, body
    ).pipe(catchError(this.handleError));
  }

  /** POST /Quantity/divide */
  divide(body: CalculationRequest): Observable<CalculationResponse> {
    return this.http.post<CalculationResponse>(
      `${this.baseUrl}/Quantity/divide`, body
    ).pipe(catchError(this.handleError));
  }

  /** Route operation string to correct method */
  calculate(operation: string, body: CalculationRequest): Observable<CalculationResponse> {
    switch (operation) {
      case 'convert':  return this.convert(body);
      case 'compare':  return this.compare(body);
      case 'add':      return this.add(body);
      case 'subtract': return this.subtract(body);
      case 'divide':   return this.divide(body);
      default: return throwError(() => new Error(`Unknown operation: ${operation}`));
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.error) {
      message = error.error?.message || error.error?.title || `HTTP ${error.status}`;
    } else if (error.status === 0) {
      message = 'Cannot reach the server.';
    }
    return throwError(() => new Error(message));
  }
}
