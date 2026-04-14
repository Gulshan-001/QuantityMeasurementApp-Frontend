import { Component, Input } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  template: `
    <div class="stat-card" [style.--stat-color]="color" [style.--stat-color-solid]="colorSolid">
      <div class="stat-icon-wrapper">
        <span class="stat-icon">{{ icon }}</span>
      </div>
      <div class="stat-content">
        <h4 class="stat-op-name">{{ operation | titlecase }}</h4>
        <div class="stat-count">
          <span class="count-value">{{ count }}</span>
          <span class="count-label">Times</span>
        </div>
      </div>
      <div class="card-bg-glow"></div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    @use '../../../../styles/mixins' as *;

    .stat-card {
      @include card-base;
      display: flex;
      align-items: center;
      gap: $sp-4;
      padding: $sp-6;
      border: 1px solid rgba(255,255,255,0.05);
      position: relative;
      overflow: hidden;
      transition: transform $tr-normal, box-shadow $tr-normal;

      // Glow effect based on CSS variables mapped to the component
      &:hover {
        transform: translateY(-4px) scale(1.02);
        border-color: var(--stat-color-solid);
        box-shadow: 0 10px 30px var(--stat-color), $shadow-md;
        
        .card-bg-glow { opacity: 0.8; }
        .stat-icon-wrapper { transform: scale(1.1) rotate(5deg); }
      }
    }

    .card-bg-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 100% 100%, var(--stat-color) 0%, transparent 60%);
      opacity: 0.15;
      transition: opacity $tr-normal;
      z-index: 0;
      pointer-events: none;
    }

    .stat-icon-wrapper {
      position: relative;
      z-index: 1;
      width: 64px;
      height: 64px;
      @include flex-center;
      background: var(--stat-color);
      border: 1.5px solid var(--stat-color-solid);
      border-radius: $radius-lg;
      box-shadow: 0 0 20px var(--stat-color);
      transition: transform $tr-normal;
    }

    .stat-icon {
      font-size: 2rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    }

    .stat-content {
      position: relative;
      z-index: 1;
      flex: 1;
    }

    .stat-op-name {
      font-size: 1.1rem;
      color: $clr-txt-muted;
      margin: 0 0 $sp-1 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-count {
      display: flex;
      align-items: baseline;
      gap: $sp-2;
    }

    .count-value {
      font-family: $font-head;
      font-size: 2.5rem;
      font-weight: 800;
      color: $clr-txt;
      line-height: 1;
    }

    .count-label {
      font-size: 0.9rem;
      color: $clr-txt-dim;
      font-weight: 500;
    }
  `]
})
export class StatCardComponent {
  @Input() operation = '';
  @Input() icon = '';
  @Input() count = 0;
  @Input() color = '';
  @Input() colorSolid = '';
}
