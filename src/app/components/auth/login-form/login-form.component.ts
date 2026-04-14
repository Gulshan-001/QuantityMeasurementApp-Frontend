// ═══════════════════════════════════════════════════════════
// login-form.component.ts — Login Form with Reactive Forms
// ═══════════════════════════════════════════════════════════
// Demonstrates: Reactive Forms, FormGroup, FormControl,
// Validators, controlled inputs, event handling, @Output,
// Google OAuth integration, conditional rendering.
// ═══════════════════════════════════════════════════════════

import { Component, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { environment } from '../../../../environments/environment';

// Declare the google global for Google Sign-In API
declare const google: any;

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements AfterViewInit {
  // ─── @Output: Child→Parent communication ───
  @Output() loginSuccess = new EventEmitter<void>();

  @ViewChild('googleBtnRef') googleBtnRef!: ElementRef;

  // ─── Reactive Form: FormGroup with FormControls and Validators ───
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private ngZone: NgZone
  ) {}

  // ─── Lifecycle Hook: AfterViewInit ───
  // Render Google Sign-In button after view is initialized
  ngAfterViewInit(): void {
    this.initGoogleSignIn();
  }

  // ─── Event Handler: Form Submit ───
  onSubmit(): void {
    // Mark all fields as touched to trigger validation display
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    // ─── Subscribe to Observable from AuthService ───
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Welcome back!', `Logged in as ${email}`);
        this.loginSuccess.emit(); // Emit event to parent
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Login failed. Check credentials.';
      }
    });
  }

  // ─── Toggle Password Visibility ───
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // ─── Google Sign-In Integration ───
  private initGoogleSignIn(): void {
    if (typeof google === 'undefined' || !google?.accounts?.id) {
      // Google API script not loaded yet, skip silently
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        // NgZone.run() ensures Angular change detection picks up the update
        this.ngZone.run(() => {
          this.handleGoogleResponse(response);
        });
      }
    });

    if (this.googleBtnRef?.nativeElement) {
      google.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
        theme: 'filled_black',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'rectangular',
      });
    }
  }

  private handleGoogleResponse(response: any): void {
    const idToken = response.credential;
    if (!idToken) {
      this.errorMessage = 'Google sign-in failed — no credential received.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.googleLogin(idToken).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Welcome!', 'Signed in with Google');
        this.loginSuccess.emit();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Google sign-in failed.';
      }
    });
  }
}
