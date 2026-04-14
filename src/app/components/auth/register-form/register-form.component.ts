import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-register-form',
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
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  // ─── @Output: Emit event to parent when registration succeeds ───
  @Output() registerSuccess = new EventEmitter<void>();

  // ─── Reactive Form with Validators ───
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loading = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  // ─── Event Handler: Form Submit ───
  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { name, email, password } = this.registerForm.value;

    this.authService.register({
      name: name!,
      email: email!,
      password: password!
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '✅ Account created! You can now log in.';
        this.toastService.success('Registered!', 'Your account has been created.');
        this.registerForm.reset();

        // Auto-switch to login tab after 1.5 seconds
        setTimeout(() => this.registerSuccess.emit(), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'An unexpected error occurred.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
