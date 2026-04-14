import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryService } from '../../services/history.service';
import { ToastService } from '../../services/toast.service';
import { HistoryItem } from '../../models/history.model';
import { OPERATIONS } from '../../data/units';
import { HistoryCardComponent } from './history-card/history-card.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HistoryCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  history: HistoryItem[] = [];
  filteredHistory: HistoryItem[] = [];
  loading = true;
  error = '';
  
  // Filter state
  filterValue = 'all';
  
  // Expose OPERATIONS to template
  operations = Object.keys(OPERATIONS).map(key => ({
    key,
    label: OPERATIONS[key].label
  }));

  constructor(
    private historyService: HistoryService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.error = '';

    const req$ = this.filterValue === 'all'
      ? this.historyService.getHistory()
      : this.historyService.getHistoryByOperation(this.filterValue);

    req$.subscribe({
      next: (data) => {
        // Sort descending; treat .NET default (0001-01-01) as epoch 0
        this.history = data.sort((a, b) => {
          const rawA = a.createdAt || '';
          const rawB = b.createdAt || '';
          const d1 = rawA.startsWith('0001') ? 0 : new Date(rawA).getTime();
          const d2 = rawB.startsWith('0001') ? 0 : new Date(rawB).getTime();
          return d2 - d1;
        });
        this.filteredHistory = [...this.history];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Failed to load history';
        this.toastService.error('Error', this.error);
      }
    });
  }

  onFilterChange(newFilter: string): void {
    this.filterValue = newFilter;
    this.loadHistory(); // Re-fetch from server per backend capabilities
  }
}
