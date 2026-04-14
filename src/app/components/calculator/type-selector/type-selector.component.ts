import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UNITS } from '../../../data/units';

@Component({
  selector: 'app-type-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './type-selector.component.html',
  styleUrls: ['./type-selector.component.scss']
})
export class TypeSelectorComponent {
  // ─── @Input: Data passed from parent (Props) ───
  @Input() selectedType = '';

  // ─── @Output: Event emitted to parent ───
  @Output() typeSelected = new EventEmitter<string>();

  // Available measurement types
  types = Object.keys(UNITS).map(key => ({
    key,
    ...UNITS[key]
  }));

  onSelectType(type: string): void {
    this.typeSelected.emit(type);
  }
}
