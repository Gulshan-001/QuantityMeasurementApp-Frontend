import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-icon">{{ icon }}</div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <!-- Optional Action Button -->
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    @use '../../../../styles/mixins' as *;

    .empty-state {
      @include card-base;
      @include flex-column($sp-3);
      padding: $sp-10 $sp-6;
      align-items: center;
      text-align: center;
      background: rgba(0,0,0,0.2); // Darker recess
      border-style: dashed; // Dashed border for empty indicator
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: $sp-2;
      opacity: 0.8;
      filter: grayscale(0.5);
    }

    .empty-title {
      font-size: 1.25rem;
      color: $clr-txt;
      margin: 0;
    }

    .empty-message {
      color: $clr-txt-muted;
      max-width: 400px;
      margin: 0 auto;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'No Data';
  @Input() message = 'There is nothing to display here yet.';
}
