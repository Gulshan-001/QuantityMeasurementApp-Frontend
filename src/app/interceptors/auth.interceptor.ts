// ═══════════════════════════════════════════════════════════
// auth.interceptor.ts — HTTP Interceptor for JWT Auth
// ═══════════════════════════════════════════════════════════
// Attaches JWT token to every outgoing request
// Handles 401 responses by logging user out
// ═══════════════════════════════════════════════════════════

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // ─── Retrieve token from localStorage ───
  const token = localStorage.getItem('qma_token');

  // ─── Clone request and attach Authorization header ───
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // ─── Handle response errors ───
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid → clear session
        localStorage.removeItem('qma_token');
        localStorage.removeItem('qma_user');
        router.navigate(['/auth']);
      }
      return throwError(() => error);
    })
  );
};
