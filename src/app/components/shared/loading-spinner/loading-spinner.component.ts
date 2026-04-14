import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    @use '../../../../styles/mixins' as *;

    .loading-container {
      @include flex-column($sp-4);
      align-items: center;
      justify-content: center;
      padding: $sp-10;
    }

    .loading-message {
      color: $clr-txt-muted;
      font-weight: 500;
      animation: pulse 1.5s ease-in-out infinite alternate;
    }
    
    @keyframes pulse {
      from { opacity: 0.6; }
      to { opacity: 1; }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
  @Input() diameter = 40;
}
