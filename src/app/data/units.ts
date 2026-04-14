// ═══════════════════════════════════════════════════════════
// units.ts — Unit Definitions & Operation Metadata
// ═══════════════════════════════════════════════════════════

export interface UnitDef {
  name: string;
  value: string;
}

export interface MeasurementTypeDef {
  label: string;
  icon: string;
  units: UnitDef[];
}

export interface OperationDef {
  icon: string;
  label: string;
  endpoint: string;
  needsSecond: boolean;
  needsTarget: boolean;
}

export interface StatOperationDef {
  op: string;
  icon: string;
  color: string;
  colorSolid: string;
}

// ─── Measurement Unit Definitions ───
export const UNITS: Record<string, MeasurementTypeDef> = {
  Length: {
    label: 'Length',
    icon: '📏',
    units: [
      { name: 'Feet',       value: 'feet' },
      { name: 'Inches',     value: 'inches' },
      { name: 'Yard',       value: 'yard' },
      { name: 'Centimeter', value: 'centimeter' },
    ],
  },
  Weight: {
    label: 'Weight',
    icon: '⚖️',
    units: [
      { name: 'Kilogram (kg)', value: 'kg' },
      { name: 'Gram (g)',      value: 'g' },
      { name: 'Tonne',         value: 'tonne' },
    ],
  },
  Volume: {
    label: 'Volume',
    icon: '🧪',
    units: [
      { name: 'Litre (l)',       value: 'litre' },
      { name: 'Millilitre (ml)', value: 'ml' },
      { name: 'Gallon',          value: 'gallon' },
    ],
  },
  Temperature: {
    label: 'Temperature',
    icon: '🌡️',
    units: [
      { name: 'Celsius',    value: 'celsius' },
      { name: 'Fahrenheit', value: 'fahrenheit' },
      { name: 'Kelvin',     value: 'kelvin' },
    ],
  },
};

// ─── Operation Metadata ───
export const OPERATIONS: Record<string, OperationDef> = {
  convert: {
    icon: '🔄',
    label: 'Convert',
    endpoint: '/Quantity/convert',
    needsSecond: false,
    needsTarget: true,
  },
  compare: {
    icon: '⚖️',
    label: 'Compare',
    endpoint: '/Quantity/compare',
    needsSecond: true,
    needsTarget: false,
  },
  add: {
    icon: '➕',
    label: 'Add',
    endpoint: '/Quantity/add',
    needsSecond: true,
    needsTarget: false,
  },
  subtract: {
    icon: '➖',
    label: 'Subtract',
    endpoint: '/Quantity/subtract',
    needsSecond: true,
    needsTarget: false,
  },
  divide: {
    icon: '➗',
    label: 'Divide',
    endpoint: '/Quantity/divide',
    needsSecond: true,
    needsTarget: false,
  },
};

// ─── Stat Operation Definitions ───
export const STAT_OPERATIONS: StatOperationDef[] = [
  { op: 'convert',  icon: '🔄', color: 'hsla(262,83%,68%,.3)',  colorSolid: 'hsl(262,83%,68%)' },
  { op: 'compare',  icon: '⚖️', color: 'hsla(38,95%,60%,.3)',   colorSolid: 'hsl(38,95%,60%)' },
  { op: 'add',      icon: '➕', color: 'hsla(145,63%,52%,.3)',  colorSolid: 'hsl(145,63%,52%)' },
  { op: 'subtract', icon: '➖', color: 'hsla(3,85%,62%,.3)',    colorSolid: 'hsl(3,85%,62%)' },
  { op: 'divide',   icon: '➗', color: 'hsla(186,100%,55%,.3)', colorSolid: 'hsl(186,100%,55%)' },
];
