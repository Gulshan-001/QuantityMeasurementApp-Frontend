// ═══════════════════════════════════════════════════════════
// quantity-input.component.ts — Reusable Quantity Input
// ═══════════════════════════════════════════════════════════
// Reusable component pattern: Used for Q1, Q2, and Target.
// Demonstrates @Input/@Output, component composition, and
// Angular Material controlled inputs.
// ═══════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitDef } from '../../../data/units';

@Component({
  selector: 'app-quantity-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quantity-input.component.html',
  styleUrls: ['./quantity-input.component.scss']
})
export class QuantityInputComponent {
  // ─── @Input Props from Parent ───
  @Input() label = 'Quantity';
  @Input() badge = 'Q1';
  @Input() badgeClass = 'q1-badge';
  @Input() value: number | null = null;
  @Input() unit = '';
  @Input() units: UnitDef[] = [];
  @Input() showValue = true;
  @Input() valuePlaceholder = 'e.g. 100';
  @Input() unitPlaceholder = '— Select unit —';
  @Input() valueError = '';
  @Input() unitError = '';

  // ─── @Output Events to Parent ───
  @Output() valueChange = new EventEmitter<number | null>();
  @Output() unitChange = new EventEmitter<string>();

  // ─── Event Handlers ───
  onValueChange(val: number | null): void {
    this.valueChange.emit(val);
  }

  onUnitChange(unit: string): void {
    this.unitChange.emit(unit);
  }
}
