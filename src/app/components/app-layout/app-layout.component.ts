import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="main-app">
      <app-header />
      <main class="app-content" role="main">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;
    .main-app {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .app-content {
      flex: 1;
      padding: $sp-8 $sp-6;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
  `]
})
export class AppLayoutComponent {}
