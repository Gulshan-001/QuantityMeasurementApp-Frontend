import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer" role="contentinfo">
      <p>Quantity Measurement App &copy; 2026 &mdash; Quantity Measurement Application</p>
    </footer>
  `,
  styles: [`
    @use '../../../styles/variables' as *;
    .app-footer {
      text-align: center;
      padding: $sp-4 $sp-6;
      border-top: 1px solid $clr-border;
      p {
        font-size: 0.8rem;
        color: $clr-txt-dim;
      }
    }
  `]
})
export class FooterComponent {}
