import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isAuthenticated = false;
  userName = '';
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {
    // ─── Subscribe to reactive auth state (RxJS) ───
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isAuthenticated = auth;
    });
    this.authService.currentUser$.subscribe(user => {
      this.userName = user?.name || user?.email || '';
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.toastService.info('Signed out', 'See you next time!');
  }
}
