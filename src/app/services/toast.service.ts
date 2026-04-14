// ═══════════════════════════════════════════════════════════
// toast.service.ts — Notification Service
// ═══════════════════════════════════════════════════════════
// Wraps Angular Material MatSnackBar for consistent toast
// notifications throughout the application.
// ═══════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly DURATION = 4000;

  constructor(private snackBar: MatSnackBar) {}

  show(type: ToastType, title: string, message: string = ''): void {
    const icons: Record<ToastType, string> = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️',
    };

    const panelClasses: Record<ToastType, string> = {
      success: 'toast-success',
      error: 'toast-error',
      info: 'toast-info',
      warning: 'toast-warning',
    };

    const config: MatSnackBarConfig = {
      duration: this.DURATION,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['toast-snackbar', panelClasses[type]],
    };

    const display = `${icons[type]} ${title}${message ? ' — ' + message : ''}`;
    this.snackBar.open(display, '✕', config);
  }

  success(title: string, message = ''): void { this.show('success', title, message); }
  error(title: string, message = ''): void   { this.show('error', title, message); }
  info(title: string, message = ''): void    { this.show('info', title, message); }
  warning(title: string, message = ''): void { this.show('warning', title, message); }
}
