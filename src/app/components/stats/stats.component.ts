import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, StatResult } from '../../services/stats.service';
import { ToastService } from '../../services/toast.service';
import { STAT_OPERATIONS, StatOperationDef } from '../../data/units';
import { StatCardComponent } from './stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';

interface StatViewModel extends StatOperationDef {
  count: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule, 
    StatCardComponent, 
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  stats: StatViewModel[] = [];
  loading = true;
  error = '';
  totalCount = 0;

  constructor(
    private statsService: StatsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';

    // Utilize forkJoin for concurrent API calls
    this.statsService.getAllCounts().subscribe({
      next: (results: StatResult[]) => {
        
        // Check for partial failures
        const failures = results.filter(r => !r.ok);
        if (failures.length > 0) {
           this.toastService.warning('Partial Load', `Failed to load stats for ${failures.length} operations.`);
        }

        // Map results back to visual definitions
        this.stats = STAT_OPERATIONS.map(def => {
          const res = results.find(r => r.op === def.op);
          return {
            ...def,
            count: res ? res.count : 0
          };
        });

        this.totalCount = this.stats.reduce((sum, item) => sum + item.count, 0);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load statistics.';
        this.toastService.error('Error', this.error);
      }
    });
  }
}
