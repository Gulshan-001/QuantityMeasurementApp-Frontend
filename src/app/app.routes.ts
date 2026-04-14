import { Routes } from '@angular/router';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { HistoryComponent } from './components/history/history.component';
import { StatsComponent } from './components/stats/stats.component';
import { AuthOverlayComponent } from './components/auth/auth-overlay/auth-overlay.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '', 
    component: AppLayoutComponent,
    children: [
      { path: '', redirectTo: 'calculator', pathMatch: 'full' },
      { path: 'calculator', component: CalculatorComponent },
      { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
      { path: 'stats', component: StatsComponent, canActivate: [authGuard] }
    ]
  },
  { path: 'auth', component: AuthOverlayComponent },
  { path: '**', redirectTo: 'calculator' }
];
