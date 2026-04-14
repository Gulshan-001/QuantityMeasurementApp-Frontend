// ═══════════════════════════════════════════════════════════
// auth.service.ts — Authentication & Session Management
// ═══════════════════════════════════════════════════════════
// Handles login, register, Google OAuth, logout, token
// management, JWT parsing, and reactive auth state.
// Uses BehaviorSubject for reactive state (RxJS).
// ═══════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse, GoogleLoginRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'qma_token';
  private readonly USER_KEY = 'qma_user';
  private readonly baseUrl = environment.apiBaseUrl;

  // ─── Reactive State with BehaviorSubject (RxJS) ───
  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private _currentUser$ = new BehaviorSubject<User | null>(null);

  /** Observable stream of authentication status */
  isAuthenticated$ = this._isAuthenticated$.asObservable();
  /** Observable stream of current user */
  currentUser$ = this._currentUser$.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // ─── Auto-session check on service initialization (Lifecycle) ───
    this.checkExistingSession();
  }

  // ═════════════════════════════════════════════════════
  // LOGIN: Authenticate with email/password
  // ═════════════════════════════════════════════════════
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleError(error))
    );
  }

  // ═════════════════════════════════════════════════════
  // REGISTER: Create new user account
  // ═════════════════════════════════════════════════════
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/auth/register`,
      data
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // ═════════════════════════════════════════════════════
  // GOOGLE LOGIN: OAuth with Google ID token
  // ═════════════════════════════════════════════════════
  googleLogin(idToken: string): Observable<AuthResponse> {
    const body: GoogleLoginRequest = { idToken };
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/google`,
      body
    ).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleError(error))
    );
  }

  // ═════════════════════════════════════════════════════
  // LOGOUT: Clear session and redirect
  // ═════════════════════════════════════════════════════
  logout(): void {
    this.removeToken();
    this.removeUser();
    this._isAuthenticated$.next(false);
    this._currentUser$.next(null);
    this.router.navigate(['/calculator']);
  }

  // ═════════════════════════════════════════════════════
  // SESSION CHECK: Auto-login if valid token exists
  // ═════════════════════════════════════════════════════
  private checkExistingSession(): void {
    const token = this.getToken();
    if (!token) return;

    // Check if token hasn't expired
    const payload = this.parseJwtPayload(token);
    if (payload?.exp && Date.now() / 1000 > payload.exp) {
      // Token expired
      this.removeToken();
      this.removeUser();
      return;
    }

    // Valid token exists → restore session
    const user = this.getUser();
    if (user) {
      this._isAuthenticated$.next(true);
      this._currentUser$.next(user);
    }
  }

  // ═════════════════════════════════════════════════════
  // AUTH SUCCESS HANDLER
  // ═════════════════════════════════════════════════════
  private handleAuthSuccess(response: AuthResponse): void {
    const token = response.token || response.Token;
    if (!token) throw new Error('No token received from server.');

    this.setToken(token);

    const payload = this.parseJwtPayload(token);
    const user: User = {
      email: payload?.email ?? '',
      name: payload?.name ?? 'User'
    };

    this.setUser(user);
    this._isAuthenticated$.next(true);
    this._currentUser$.next(user);
  }

  // ═════════════════════════════════════════════════════
  // JWT TOKEN PARSING
  // ═══════════════════════════════════════════════════
  private parseJwtPayload(token: string): any {
    try {
      const b64 = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      return JSON.parse(atob(b64));
    } catch {
      return null;
    }
  }

  // ═════════════════════════════════════════════════════
  // TOKEN MANAGEMENT (LocalStorage)
  // ═════════════════════════════════════════════════════
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // ═════════════════════════════════════════════════════
  // USER INFO MANAGEMENT (LocalStorage)
  // ═════════════════════════════════════════════════════
  getUser(): User | null {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // ─── Synchronous auth check ───
  get isLoggedIn(): boolean {
    return this._isAuthenticated$.value;
  }

  // ═════════════════════════════════════════════════════
  // ERROR HANDLING
  // ═════════════════════════════════════════════════════
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.error) {
      message = error.error?.message
        || error.error?.title
        || error.error?.errors?.[Object.keys(error.error.errors)[0]]?.[0]
        || `HTTP ${error.status}: ${error.statusText}`;
    } else if (error.status === 0) {
      message = 'Cannot reach the server. Make sure the backend is running.';
    }
    return throwError(() => new Error(message));
  }
}
