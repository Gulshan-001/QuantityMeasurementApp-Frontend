/**
 * ═══════════════════════════════════════════════════════════
 * units.js — Unit Definitions & Management
 * ═══════════════════════════════════════════════════════════
 * 
 * This file defines all the measurement units supported by the app
 * and provides a UnitManager class to handle unit dropdown population
 * and type management.
 * 
 * Topics Covered:
 * - Objects and nested data structures
 * - ES6 Classes
 * - DOM manipulation for dropdowns
 * - Conditional logic for UI updates
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ═════════════════════════════════════════════════════
// UNIT DEFINITIONS: All supported measurement types
// ═════════════════════════════════════════════════════
// 
// Structure: 
// {
//   TypeName: {
//     label: 'Display name',
//     icon: 'Emoji icon',
//     units: [
//       { name: 'Display name', value: 'database_value' },
//       ...
//     ]
//   }
// }
//
// Object.freeze() prevents accidental modifications
const UNITS = Object.freeze({
  Length: {
    label: 'Length',
    icon:  '📏',
    units: [
      { name: 'Feet',       value: 'feet' },
      { name: 'Inches',     value: 'inches' },
      { name: 'Yard',       value: 'yard' },
      { name: 'Centimeter', value: 'centimeter' },
    ],
  },
  Weight: {
    label: 'Weight',
    icon:  '⚖️',
    units: [
      { name: 'Kilogram (kg)', value: 'kg' },
      { name: 'Gram (g)',      value: 'g' },
      { name: 'Tonne',         value: 'tonne' },
    ],
  },
  Volume: {
    label: 'Volume',
    icon:  '🧪',
    units: [
      { name: 'Litre (l)',     value: 'litre' },
      { name: 'Millilitre (ml)', value: 'ml' },
      { name: 'Gallon',        value: 'gallon' },
    ],
  },
  Temperature: {
    label: 'Temperature',
    icon:  '🌡️',
    units: [
      { name: 'Celsius',    value: 'celsius' },
      { name: 'Fahrenheit', value: 'fahrenheit' },
      { name: 'Kelvin',     value: 'kelvin' },
    ],
  },
});

// ═════════════════════════════════════════════════════
// UnitManager CLASS: Manages units and dropdowns
// ═════════════════════════════════════════════════════
// 
// This class provides an organized way to manage unit data
// and keep track of the currently selected measurement type.
class UnitManager {
  constructor(unitDefs) {
    this._defs = unitDefs;        // Store unit definitions
    this._currentType = '';       // Track currently selected type
  }

  /** Returns list of available measurement types (Length, Weight, etc.) */
  getTypes() {
    return Object.keys(this._defs);
  }

  /** Returns the array of units for a given measurement type */
  getUnits(type) {
    return this._defs[type]?.units ?? [];
  }

  /** Returns the emoji icon for a measurement type */
  getIcon(type) {
    return this._defs[type]?.icon ?? '🔢';
  }

  // ─── Setters & Getters for current type ───
  setCurrentType(type) { this._currentType = type; }
  getCurrentType()     { return this._currentType; }

  /**
   * Populates a <select> HTML element with unit options
   * 
   * @param {HTMLSelectElement} selectEl - The dropdown to populate
   * @param {string} type - The measurement type (e.g., 'Length')
   * @param {string} placeholder - Text for the empty option
   * @param {string} exclude - Unit value to skip (optional, used to avoid selecting same unit twice)
   * 
   * Example: populateSelect(document.getElementById('unit-select'), 'Length')
   */
  populateSelect(selectEl, type, placeholder = '— Select unit —', exclude = '') {
    // Clear existing options
    selectEl.innerHTML = '';

    // Create and add placeholder option
    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = placeholder;
    selectEl.appendChild(placeholderOpt);

    // Get units for this type
    const units = this.getUnits(type);

    // Dynamic rendering: Loop through units and create option elements
    units.forEach(unit => {
      // Handle both string and object formats
      const val  = typeof unit === 'string' ? unit : unit.value;
      const text = typeof unit === 'string' ? unit : unit.name;

      if (val === exclude) return;  // Skip this unit if it matches exclude value

      // Create option element
      const opt = document.createElement('option');
      opt.value       = val;
      opt.textContent = text;
      selectEl.appendChild(opt);
    });
  }
}

// ═════════════════════════════════════════════════════
// GLOBAL FUNCTIONS: Handle measurement type selection
// ═════════════════════════════════════════════════════

/**
 * Called when user clicks on a measurement type button (Length, Weight, etc.)
 * Updates the hidden input field and triggers dropdown population
 * 
 * @param {string} type - The selected measurement type
 */
function selectType(type) {
  const typeInput = document.getElementById('measure-type');
  if (!typeInput) return;

  // Store selected type in hidden field
  typeInput.value = type;

  // Update UI: Show which type is selected
  document.querySelectorAll('.type-card').forEach(card => {
    const isSelected = card.getAttribute('data-type') === type;
    card.classList.toggle('active', isSelected);
    card.setAttribute('aria-selected', isSelected);
  });

  // Populate dropdowns with units for this type
  handleTypeChange();
}

/**
 * Helper function: Populates all unit dropdowns based on selected type
 * Called after measurement type selection
 */
function handleTypeChange() {
  const type = document.getElementById('measure-type').value;
  unitManager.setCurrentType(type);

  const q1Unit     = document.getElementById('q1-unit');
  const q2Unit     = document.getElementById('q2-unit');
  const targetUnit = document.getElementById('target-unit');

  if (!type) {
    // No type selected: Reset all dropdowns to placeholder
    [q1Unit, q2Unit, targetUnit].forEach(sel => {
      sel.innerHTML = '<option value="">— Select unit —</option>';
    });
    return;
  }

  // Populate each dropdown with units for the selected type
  unitManager.populateSelect(q1Unit,     type);
  unitManager.populateSelect(q2Unit,     type);
  unitManager.populateSelect(targetUnit, type);

  // Clear validation error classes
  [q1Unit, q2Unit, targetUnit].forEach(el => {
    el.classList.remove('is-invalid', 'is-valid');
  });

  // Dynamic: When first unit changes, update target unit (exclude selected Q1 unit)
  q1Unit.onchange = () => {
    const selectedQ1 = q1Unit.value;
    unitManager.populateSelect(targetUnit, type, '— Select target unit —', selectedQ1);
  };
}

// ═════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═════════════════════════════════════════════════════
// Create a single global instance of UnitManager
// Used throughout the app to manage units
const unitManager = new UnitManager(UNITS);
