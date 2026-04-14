import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginFormComponent } from '../login-form/login-form.component';
import { RegisterFormComponent } from '../register-form/register-form.component';

@Component({
  selector: 'app-auth-overlay',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, RegisterFormComponent],
  templateUrl: './auth-overlay.component.html',
  styleUrls: ['./auth-overlay.component.scss']
})
export class AuthOverlayComponent {
  activeTab: 'login' | 'register' = 'login';

  constructor(private router: Router) {}

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
  }

  closeOverlay(): void {
    this.router.navigate(['/calculator']);
  }

  onLoginSuccess(): void {
    this.router.navigate(['/calculator']);
  }

  onRegisterSuccess(): void {
    this.activeTab = 'login';
  }
}
