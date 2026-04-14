import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { HistoryItem } from '../../../models/history.model';
import { OPERATIONS } from '../../../data/units';

@Component({
  selector: 'app-history-card',
  standalone: true,
  imports: [CommonModule, DatePipe, TitleCasePipe],
  templateUrl: './history-card.component.html',
  styleUrls: ['./history-card.component.scss']
})
export class HistoryCardComponent {
  @Input() item!: HistoryItem;

  /** Resolved operation key (lowercase) for icon/label lookup */
  get opKey(): string {
    return (this.item.operationType || '').toLowerCase();
  }

  /** Nice label from OPERATIONS map, or TitleCase of the raw type */
  get displayName(): string {
    return OPERATIONS[this.opKey]?.label || this.item.operationType || 'Unknown';
  }

  get opIcon(): string {
    return OPERATIONS[this.opKey]?.icon || '⚡';
  }

  /** Measurement type (inputType), e.g. "length", "weight" */
  get category(): string {
    return this.item.inputType || '';
  }

  /** The expression side, e.g. "2 feet + 24 inch" */
  get inputData(): string {
    return this.item.inputData || '—';
  }

  /** The result side, e.g. "4 feet" */
  get resultData(): string {
    return this.item.resultData || '—';
  }

  get dateStr(): string {
    const raw = this.item.createdAt || '';
    // .NET default DateTime is 0001-01-01 — treat as missing
    if (!raw || raw.startsWith('0001-01-01')) return '';
    
    // If backend sends UTC time but omitting the timezone marker, append 'Z'
    // so JS parses it as UTC and inherently translates it to the user's local time (e.g. GMT+5:30)
    if (!raw.endsWith('Z')) {
      return raw + 'Z';
    }
    return raw;
  }

  get succeeded(): boolean {
    return this.item.isSuccess !== false;
  }

  get errorMsg(): string {
    return this.item.errorMessage || '';
  }
}
