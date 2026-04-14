import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OPERATIONS } from '../../../data/units';

@Component({
  selector: 'app-operation-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operation-selector.component.html',
  styleUrls: ['./operation-selector.component.scss']
})
export class OperationSelectorComponent {
  @Input() selectedOperation = 'convert';
  @Output() operationSelected = new EventEmitter<string>();

  operations = Object.keys(OPERATIONS).map(key => ({
    key,
    ...OPERATIONS[key]
  }));

  onSelectOperation(op: string): void {
    this.operationSelected.emit(op);
  }
}
