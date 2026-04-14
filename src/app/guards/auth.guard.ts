// ═══════════════════════════════════════════════════════════
// auth.guard.ts — Route Guard for Protected Routes
// ═══════════════════════════════════════════════════════════
// Uses Angular 17+ functional guard pattern.
// Redirects to /auth if user is not authenticated.
// ═══════════════════════════════════════════════════════════

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
  }

  // Not authenticated → redirect to auth page
  router.navigate(['/auth']);
  return false;
};
