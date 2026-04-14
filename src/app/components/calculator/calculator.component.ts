import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TypeSelectorComponent } from './type-selector/type-selector.component';
import { OperationSelectorComponent } from './operation-selector/operation-selector.component';
import { QuantityInputComponent } from './quantity-input/quantity-input.component';
import { ResultPanelComponent } from './result-panel/result-panel.component';
import { CalculatorService } from '../../services/calculator.service';
import { ToastService } from '../../services/toast.service';
import { CalculationRequest, QuantityDTO } from '../../models/quantity.model';
import { UNITS, OPERATIONS } from '../../data/units';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    TypeSelectorComponent,
    OperationSelectorComponent,
    QuantityInputComponent,
    ResultPanelComponent
  ],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {
  // ─── State ───
  selectedType = 'Length';
  selectedOperation = 'convert';
  
  // Q1 State
  q1Value: number | null = null;
  q1Unit = '';
  
  // Q2 State (only if needed)
  q2Value: number | null = null;
  q2Unit = '';

  // Target Unit State (only if needed)
  targetUnit = '';

  // Result State
  result: any = null;
  loading = false;
  calculationError = '';

  // Form Validation State
  errors = {
    q1value: '', q1unit: '', q2value: '', q2unit: '', targetUnit: ''
  };

  constructor(
    private calculatorService: CalculatorService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Set default units for the initially selected type
    this.setDefaultUnits();
  }

  // ─── Helpers ───
  
  get currentUnits() {
    return UNITS[this.selectedType]?.units || [];
  }

  get needsSecondOperation() {
    return OPERATIONS[this.selectedOperation]?.needsSecond || false;
  }

  get needsTargetUnit() {
    return OPERATIONS[this.selectedOperation]?.needsTarget || false;
  }

  setDefaultUnits(): void {
    const units = this.currentUnits;
    if (units.length > 0) {
      this.q1Unit = units[0].value;
      if (units.length > 1) {
        this.q2Unit = units[1].value;
        this.targetUnit = units[1].value;
      } else {
        this.q2Unit = units[0].value;
        this.targetUnit = units[0].value;
      }
    }
  }

  clearErrors(): void {
    this.errors = { q1value: '', q1unit: '', q2value: '', q2unit: '', targetUnit: '' };
    this.calculationError = '';
  }

  // ─── Event Handlers from Child Components ───

  onTypeChanged(type: string): void {
    this.selectedType = type;
    this.clearErrors();
    this.result = null;
    this.setDefaultUnits();
    // Reset values but keep the visual state clean
    this.q1Value = null;
    this.q2Value = null;
  }

  onOperationChanged(op: string): void {
    this.selectedOperation = op;
    this.clearErrors();
    this.result = null;
  }

  onCalculate(): void {
    if (!this.validateParams()) {
      this.toastService.warning('Validation Failed', 'Please check the highlighted fields.');
      return;
    }

    this.loading = true;
    this.calculationError = '';
    this.result = null;

    const request: CalculationRequest = {
      first: {
        value: this.q1Value!,
        unit: this.q1Unit,
        measurementType: this.selectedType
      },
      second: {
        value: this.needsSecondOperation ? this.q2Value! : 0,
        unit: this.needsSecondOperation ? this.q2Unit : this.q1Unit,
        measurementType: this.selectedType
      }
    };

    if (this.needsTargetUnit) {
      request.targetUnit = this.targetUnit;
    }

    this.calculatorService.calculate(this.selectedOperation, request).subscribe({
      next: (res) => {
        this.loading = false;
        this.result = res.data ?? res.Data ?? res;
        this.toastService.success('Calculation Complete');
      },
      error: (err) => {
        this.loading = false;
        this.calculationError = err.message || 'Calculation failed.';
        this.toastService.error('Calculation Failed', this.calculationError);
      }
    });
  }

  onClearResult(): void {
    this.result = null;
    this.calculationError = '';
  }

  // ─── Validation ───

  validateParams(): boolean {
    let isValid = true;
    this.clearErrors();

    // Validate Q1
    if (this.q1Value === null || this.q1Value === undefined) {
      this.errors.q1value = 'Required';
      isValid = false;
    }
    if (!this.q1Unit) {
      this.errors.q1unit = 'Required';
      isValid = false;
    }

    // Validate Q2 if needed
    if (this.needsSecondOperation) {
      if (this.q2Value === null || this.q2Value === undefined) {
        this.errors.q2value = 'Required';
        isValid = false;
      }
      if (!this.q2Unit) {
        this.errors.q2unit = 'Required';
        isValid = false;
      }
    }

    // Validate Target Unit if needed
    if (this.needsTargetUnit) {
      if (!this.targetUnit) {
        this.errors.targetUnit = 'Required';
        isValid = false;
      }
    }

    return isValid;
  }
}
