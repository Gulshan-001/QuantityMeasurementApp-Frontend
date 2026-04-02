/**
 * ═══════════════════════════════════════════════════════════
 * calculator.js — Core Calculation Engine
 * ═══════════════════════════════════════════════════════════
 * 
 * This file contains the main calculation logic:
 * 1. Operation selection (Convert, Compare, Add, Subtract, Divide)
 * 2. Form validation
 * 3. Request building
 * 4. AJAX submission to backend
 * 5. Result display and formatting
 * 
 * Topics Covered:
 * - DOM manipulation and event handling
 * - Form validation
 * - AJAX/Fetch API
 * - Async/Await and error handling
 * - ES9: Destructuring, optional chaining, nullish coalescing
 * - Conditional UI updates
 * - Dynamic result formatting
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ═════════════════════════════════════════════════════
// STATE: Current operation selection
// ═════════════════════════════════════════════════════

let currentOperation = 'convert';   // Track which operation user selected

// ═════════════════════════════════════════════════════
// OPERATIONS: Metadata for each operation type
// ═════════════════════════════════════════════════════
// 
// Defines:
// - icon: Emoji for display
// - label: Button text
// - endpoint: Backend API route
// - needsSecond: Whether operation requires second quantity
// - needsTarget: Whether operation requires target unit (convert only)

const OPERATIONS = {
  // Convert: Change units (e.g., feet to meters)
  convert:  { 
    icon: '🔄', 
    label: 'Convert',  
    endpoint: CONFIG.ENDPOINTS.convert,  
    needsSecond: false,  // Only need Q1, not Q2
    needsTarget: true    // Need target unit
  },

  // Compare: Check if two quantities are equal
  compare:  { 
    icon: '⚖️', 
    label: 'Compare',  
    endpoint: CONFIG.ENDPOINTS.compare,  
    needsSecond: true,   // Need both Q1 and Q2
    needsTarget: false   // No target unit
  },

  // Add: Sum two quantities
  add:      { 
    icon: '➕', 
    label: 'Add',       
    endpoint: CONFIG.ENDPOINTS.add,      
    needsSecond: true,   // Need both Q1 and Q2
    needsTarget: false   // No target unit
  },

  // Subtract: Find difference between quantities
  subtract: { 
    icon: '➖', 
    label: 'Subtract',  
    endpoint: CONFIG.ENDPOINTS.subtract, 
    needsSecond: true,   // Need both Q1 and Q2
    needsTarget: false   // No target unit
  },

  // Divide: Divide one quantity by another
  divide:   { 
    icon: '➗', 
    label: 'Divide',    
    endpoint: CONFIG.ENDPOINTS.divide,   
    needsSecond: true,   // Need both Q1 and Q2
    needsTarget: false   // No target unit
  },
};

// ═════════════════════════════════════════════════════
// SELECT OPERATION: User picks an operation
// ═════════════════════════════════════════════════════

/**
 * Called when user clicks on an operation button
 * Updates UI to show/hide fields based on operation
 * 
 * @param {string} op - Operation: 'convert', 'compare', 'add', 'subtract', 'divide'
 */
function selectOperation(op) {
  currentOperation = op;

  // ─── Update Active State ───
  // Highlight the selected operation button
  document.querySelectorAll('.op-card').forEach(card => {
    card.classList.toggle('active', card.dataset.op === op);
  });

  // Update button label
  document.getElementById('calc-btn-text').textContent = OPERATIONS[op].label;

  // ─── Show/Hide Form Fields ───
  // Conditionally display Q2 and target unit based on operation
  const meta     = OPERATIONS[op];
  const q2Card   = document.getElementById('q2-card');    // Second quantity
  const tgtCard  = document.getElementById('target-card'); // Target unit

  q2Card.style.display  = meta.needsSecond  ? '' : 'none';  // Show if needed
  tgtCard.style.display = meta.needsTarget  ? '' : 'none';  // Show if needed

  // ─── Clear Previous Results ───
  closeResult();      // Hide old result panel
  clearCalcError();   // Clear error message

  // ─── Update Target Unit Dropdown ───
  // If type already selected and target unit is needed, populate options
  if (unitManager.getCurrentType() && meta.needsTarget) {
    const q1Val = document.getElementById('q1-unit').value;
    unitManager.populateSelect(
      document.getElementById('target-unit'),
      unitManager.getCurrentType(),
      '— Select target unit —',
      q1Val  // Exclude the source unit from options
    );
  }
}

// ═════════════════════════════════════════════════════
// VALIDATE CALCULATOR FORM: Check all inputs
// ═════════════════════════════════════════════════════

/**
 * Validates entire calculator form before submission
 * Checks all required fields based on current operation
 * Shows field-level error messages
 * 
 * @returns {boolean} true if valid, false if any field invalid
 */
function validateCalcForm() {
  let valid = true;

  const type    = document.getElementById('measure-type');
  const q1Val   = document.getElementById('q1-value');
  const q1Unit  = document.getElementById('q1-unit');
  const meta    = OPERATIONS[currentOperation];

  // ─── Validate Measurement Type ───
  if (!type.value) {
    showFieldError('measure-type', 'Please select a measurement type.');
    type.classList.add('is-invalid');
    valid = false;
  } else {
    type.classList.remove('is-invalid');
    document.getElementById('measure-type')?.nextElementSibling?.removeAttribute('textContent');
  }

  // ─── Validate Q1 Value ───
  if (q1Val.value === '' || isNaN(Number(q1Val.value))) {
    q1Val.classList.add('is-invalid');
    document.getElementById('q1-value-error').textContent = 'Enter a valid number.';
    valid = false;
  } else {
    q1Val.classList.remove('is-invalid');
    document.getElementById('q1-value-error').textContent = '';
  }

  // ─── Validate Q1 Unit ───
  if (!q1Unit.value) {
    q1Unit.classList.add('is-invalid');
    document.getElementById('q1-unit-error').textContent = 'Select a unit.';
    valid = false;
  } else {
    q1Unit.classList.remove('is-invalid');
    document.getElementById('q1-unit-error').textContent = '';
  }

  // ─── Validate Q2 (if operation needs second quantity) ───
  if (meta.needsSecond) {
    const q2Val  = document.getElementById('q2-value');
    const q2Unit = document.getElementById('q2-unit');

    if (q2Val.value === '' || isNaN(Number(q2Val.value))) {
      q2Val.classList.add('is-invalid');
      document.getElementById('q2-value-error').textContent = 'Enter a valid number.';
      valid = false;
    } else {
      q2Val.classList.remove('is-invalid');
      document.getElementById('q2-value-error').textContent = '';
    }

    if (!q2Unit.value) {
      q2Unit.classList.add('is-invalid');
      document.getElementById('q2-unit-error').textContent = 'Select a unit.';
      valid = false;
    } else {
      q2Unit.classList.remove('is-invalid');
      document.getElementById('q2-unit-error').textContent = '';
    }
  }

  /* Target unit (for convert) */
  if (meta.needsTarget) {
    const tgtUnit = document.getElementById('target-unit');
    if (!tgtUnit.value) {
      tgtUnit.classList.add('is-invalid');
      document.getElementById('target-unit-error').textContent = 'Select a target unit.';
      valid = false;
    } else {
      tgtUnit.classList.remove('is-invalid');
      document.getElementById('target-unit-error').textContent = '';
    }
  }

  return valid;
}

function showFieldError(id, msg) {
  const el = document.getElementById(id + '-error');
  if (el) el.textContent = msg;
}

// ═════════════════════════════════════════════════════
// BUILD REQUEST: Prepare data for API submission
// ═════════════════════════════════════════════════════

/**
 * Builds the request object to send to backend
 * Structure depends on current operation type
 * 
 * @returns {object} Request body:
 *   {
 *     first: { value, unit, measurementType },
 *     second: { value, unit, measurementType },  // if needed
 *     targetUnit: 'feet'  // if needed
 *   }
 */
/* ─── Build Request Body ─── */
function buildRequestBody() {
  const type   = document.getElementById('measure-type').value;
  const meta   = OPERATIONS[currentOperation];

  // ─── Build First Quantity ───
  // ES9 object literal with shorthand properties
  /* ES9 object shorthand + computed properties */
  const first = {
    value:           Number(document.getElementById('q1-value').value),
    unit:            document.getElementById('q1-unit').value,
    measurementType: type,
  };

  // ─── Start with first quantity ───
  const body = { first };

  // ─── Add Second Quantity if needed ───
  if (meta.needsSecond) {
    body.second = {
      value:           Number(document.getElementById('q2-value').value),
      unit:            document.getElementById('q2-unit').value,
      measurementType: type,
    };
  } else {
    // Some backends require second even if not used
    // ES9 spread operator to copy first quantity
    /* Provide a dummy second so backend won't complain if it's required */
    body.second = { ...first };
  }

  // ─── Add Target Unit if needed ───
  if (meta.needsTarget) {
    body.targetUnit = document.getElementById('target-unit').value;
  }

  return body;
}

// ═════════════════════════════════════════════════════
// DISPLAY RESULT: Show calculation result to user
// ═════════════════════════════════════════════════════

/**
 * Display successful calculation result
 * Formats result based on operation type
 * 
 * @param {object} data - Response from backend
 * @param {string} op - Operation type
 */
/* ─── Display Result (Dynamic UI Rendering) ─── */
function displayResult(data, op) {
  const panel   = document.getElementById('result-panel');
  const iconEl  = document.getElementById('result-icon');
  const valEl   = document.getElementById('result-value');
  const msgEl   = document.getElementById('result-message');

  // ─── Extract Data (ES9 optional chaining + nullish coalescing) ───
  // Safely get data, handling different backend property names
  /* ES9 optional chaining + nullish coalescing */
  const rawData = data?.data ?? data?.Data;
  const message = data?.message ?? data?.Message ?? 'Done';

  const opMeta  = OPERATIONS[op];
  let displayVal;

  // ─── Format Result by Operation Type ───
  /* Conditional formatting per operation type */
  if (op === 'compare') {
    // Compare returns true/false
    displayVal      = rawData === true ? '✅ Equal' : '❌ Not Equal';
    iconEl.textContent = rawData === true ? '⚖️' : '≠';
  } else if (op === 'convert' && rawData !== null && typeof rawData === 'object') {
    // Convert returns QuantityDTO { value, unit }
    /* Convert returns QuantityDTO */
    const { value, unit } = rawData;
    displayVal      = `${Number(value).toFixed(4)} ${unit}`;
    iconEl.textContent = '🔄';
  } else if (op === 'add' || op === 'subtract') {
    // Add/Subtract return quantity result
    if (rawData !== null && typeof rawData === 'object') {
      const { value, unit } = rawData;
      displayVal = `${Number(value).toFixed(4)} ${unit}`;
    } else {
      displayVal = String(rawData);
    }
    iconEl.textContent = opMeta.icon;
  } else {
    // Divide returns numeric value
    displayVal      = typeof rawData === 'number'
      ? Number(rawData).toFixed(6)
      : String(rawData);
    iconEl.textContent = opMeta.icon;
  }

  valEl.textContent = displayVal;
  msgEl.textContent = message;

  panel.classList.remove('hidden', 'result-error');
}

// ─── Display Error ───
/**
 * Display error in result panel
 * @param {string} msg - Error message
 */
/* ─── Display Error in Result Panel ─── */
function displayResultError(msg) {
  const panel  = document.getElementById('result-panel');
  const iconEl = document.getElementById('result-icon');
  const valEl  = document.getElementById('result-value');
  const msgEl  = document.getElementById('result-message');

  iconEl.textContent = '⚠️';
  valEl.textContent  = 'Error';
  msgEl.textContent  = msg;

  panel.classList.remove('hidden');
  panel.classList.add('result-error');
}

/**
 * Hide the result panel
 */
function closeResult() {
  document.getElementById('result-panel').classList.add('hidden');
}

/**
 * Clear error message from calculator
 */
function clearCalcError() {
  const errEl = document.getElementById('calc-error');
  errEl.textContent = '';
  errEl.classList.add('hidden');
}

// ═════════════════════════════════════════════════════
// RESET FORM: Clear all inputs
// ═════════════════════════════════════════════════════

/**
 * Clear all form inputs and reset to initial state
 */
/* ─── Reset Form ─── */
function resetForm() {
  document.getElementById('calc-form').reset();
  
  // Reset hidden type input and UI
  /* Reset hidden type input and UI */
  const typeInput = document.getElementById('measure-type');
  if (typeInput) typeInput.value = '';
  document.querySelectorAll('.type-card').forEach(card => card.classList.remove('active'));

  // Reset unit dropdowns
  ['q1-unit', 'q2-unit', 'target-unit'].forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = '<option value="">— Select unit —</option>';
  });
  // Clear error messages
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  // Remove validation styling
  document.querySelectorAll('#calc-form input, #calc-form select')
    .forEach(el => el.classList.remove('is-invalid', 'is-valid'));
  clearCalcError();
  closeResult();
}

// ═════════════════════════════════════════════════════
// FORM SUBMISSION HANDLER: Main calculation flow
// ═════════════════════════════════════════════════════

/**
 * Handle form submission
 * Complete flow: Validate → Build → Submit → Display Result
 * Uses async/await for clean asynchronous code
 */
/* ─── MAIN SUBMIT HANDLER (Async/Await + AJAX) ─── */
document.getElementById('calc-form').addEventListener('submit', async function(e) {
  e.preventDefault();  // Prevent browser default form submission

  // ─── Validate Form ───
  if (!validateCalcForm()) return;  // Stop if validation fails

  clearCalcError();
  closeResult();

  // ─── Show Loading State ───
  // Disable button and show spinner while request is in progress
  /* Loading state */
  const btn     = document.getElementById('btn-calculate');
  const text    = btn.querySelector('.btn-text');
  const spinner = document.getElementById('calc-spinner');
  btn.disabled  = true;           // Prevent double-submission
  text.classList.add('hidden');   // Hide button text
  spinner.classList.remove('hidden');  // Show loading spinner

  const op   = currentOperation;
  const meta = OPERATIONS[op];
  const body = buildRequestBody();

  try {
    // ─── Submit to Backend (AJAX via async/await) ───
    // Wait for HTTP response and parse JSON
    /* AJAX call using async/await */
    const data = await api.post(meta.endpoint, body);
    
    // ─── Success: Display result ───
    displayResult(data, op);
    showToast('success', `${meta.label} complete!`, data?.message ?? '');
  } catch (err) {
    // ─── Error: Show error message ───
    const msg = err instanceof ApiError ? err.message : 'An unexpected error occurred.';
    displayResultError(msg);

    const errEl = document.getElementById('calc-error');
    errEl.textContent = msg;
    errEl.classList.remove('hidden');

    showToast('error', 'Operation failed', msg);
  } finally {
    // ─── Always Reset Button State ───
    // Runs whether success or failure to restore button
    btn.disabled = false;
    text.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
});
