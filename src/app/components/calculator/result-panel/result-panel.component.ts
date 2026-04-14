import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-panel.component.html',
  styleUrls: ['./result-panel.component.scss']
})
export class ResultPanelComponent {
  @Input() result: any = null;
  @Input() operation = '';
  @Input() error = '';
  @Output() closed = new EventEmitter<void>();

  onClose(): void {
    this.closed.emit();
  }

  isComplexResult(): boolean {
    // If the result is an object with multiple value/unit pairs, it's complex
    return this.result !== null && typeof this.result === 'object' && !('value' in this.result) && !('Value' in this.result);
  }

  isTextResult(): boolean {
    return typeof this.result === 'string' || typeof this.result === 'boolean';
  }

  getTextResult(): string {
    if (typeof this.result === 'boolean') {
      return this.result ? 'Quantities are Equal' : 'Quantities are Not Equal';
    }
    return String(this.result);
  }

  getResultValue(): any {
    return this.result?.value ?? this.result?.Value ?? this.result;
  }

  getResultUnit(): string {
    return this.result?.unit ?? this.result?.Unit ?? '';
  }
}
