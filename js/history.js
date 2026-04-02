/**
 * ═══════════════════════════════════════════════════════════
 * history.js — Operation History Management
 * ═══════════════════════════════════════════════════════════
 * 
 * This file handles:
 * 1. Fetching user's calculation history from backend
 * 2. Filtering history by operation type
 * 3. Rendering history as cards
 * 4. Displaying loading and empty states
 * 
 * Topics Covered:
 * - AJAX / Fetch API
 * - Async/Await
 * - Dynamic UI rendering
 * - DOM manipulation (createElement, innerHTML)
 * - Filter logic and conditional rendering
 * - Document Fragments for performance
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ═════════════════════════════════════════════════════
// STATE: Global variables for history data
// ═════════════════════════════════════════════════════

let allHistory = [];      // All operations from backend
let currentFilter = 'all'; // Currently selected filter

// ═════════════════════════════════════════════════════
// LOAD HISTORY: Fetch from backend API
// ═════════════════════════════════════════════════════

/**
 * Fetch operation history from backend
 * Called when History tab is clicked
 * Uses Async/Await to wait for API response
 */
async function loadHistory() {
  showHistoryLoading(true);
  showHistoryError('');

  try {
    // AJAX call to backend (uses Fetch API)
    const data = await api.get(CONFIG.ENDPOINTS.history);

    // ES9 optional chaining - safely extract data
    // Handles different property names from backend (data vs Data)
    allHistory = data?.data ?? data?.Data ?? [];

    // Render with current filter
    renderHistory(allHistory, currentFilter);
  } catch (err) {
    // Handle error
    const msg = err instanceof ApiError ? err.message : 'Failed to load history.';
    showHistoryError(msg);
    showToast('error', 'History error', msg);
  } finally {
    // Always hide loading spinner
    showHistoryLoading(false);
  }
}

// ═════════════════════════════════════════════════════
// FILTER HISTORY: By operation type
// ═════════════════════════════════════════════════════

/**
 * Filter history by operation type
 * Called when user selects filter dropdown
 * 
 * @param {string} operation - Filter value: 'all', 'convert', 'compare', etc.
 */
function filterHistory(operation) {
  currentFilter = operation;

  // Filter array based on operation (case-insensitive)
  const filtered = operation === 'all'
    ? allHistory
    : allHistory.filter(item => {
        // Handle different property names from backend
        return (item.operation ?? item.Operation ?? '').toLowerCase() === operation.toLowerCase();
      });

  // Re-render with filtered results
  renderHistory(filtered, operation);
}

// ═════════════════════════════════════════════════════
// RENDER HISTORY: Display filtered results
// ═════════════════════════════════════════════════════

/**
 * Render history items as cards
 * 
 * @param {array} items - History items to display
 * @param {string} filter - Current filter (for display)
 */
function renderHistory(items, filter) {
  const grid    = document.getElementById('history-grid');
  const empty   = document.getElementById('history-empty');

  // Clear previous content
  grid.innerHTML = '';

  // Show empty state if no items
  if (!items || items.length === 0) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  // ─── Performance Optimization: Use DocumentFragment ───
  // Adding many elements to DOM one-by-one is slow.
  // Fragment batches changes, then adds all at once.
  const fragment = document.createDocumentFragment();

  // Create card for each history item
  items.forEach(item => {
    const card = createHistoryCard(item);
    fragment.appendChild(card);
  });

  // Add all cards at once (more efficient)
  grid.appendChild(fragment);
}

// ═════════════════════════════════════════════════════
// CREATE HISTORY CARD: Build card element for one item
// ═════════════════════════════════════════════════════

/**
 * Build a history card element
 * Shows details of one calculation
 * 
 * @param {object} item - History item from backend
 * @returns {HTMLElement} Formatted card element
 */
function createHistoryCard(item) {
  // ─── ES9 Destructuring ───
  // Extract properties with defaults (handles backend variations)
  const {
    operation = item.Operation ?? 'Unknown',
    measurementType = item.MeasurementType ?? '',
    firstValue = item.FirstValue ?? item.firstValue ?? '',
    firstUnit  = item.FirstUnit  ?? item.firstUnit  ?? '',
    secondValue= item.SecondValue?? item.secondValue?? null,
    secondUnit = item.SecondUnit ?? item.secondUnit ?? null,
    resultValue= item.ResultValue?? item.resultValue?? '',
    resultUnit = item.ResultUnit ?? item.resultUnit ?? '',
    createdAt  = item.CreatedAt  ?? item.createdAt  ?? '',
    targetUnit = item.TargetUnit ?? item.targetUnit ?? null,
  } = item;

  // Get operation metadata (icon, label)
  const op       = (operation ?? '').toLowerCase();
  const opMeta   = OPERATIONS[op] ?? { icon: '🔢', label: operation };

  // ─── Build Card Element ───
  const card = document.createElement('article');
  card.className = 'history-card';
  card.setAttribute('data-op', op);
  card.setAttribute('role', 'listitem');

  // Card header: Operation badge and type badge
  const header = document.createElement('div');
  header.className = 'history-card-header';
  header.innerHTML = `
    <span class="history-op-badge">${opMeta.icon} ${operation}</span>
    <span class="history-type-badge">${measurementType}</span>
  `;
  card.appendChild(header);

  // Card body: Details of the calculation
  const body = document.createElement('div');
  body.className = 'history-card-body';

  // Build list of details to display
  const details = [
    { label: 'Q1', val: `${firstValue} ${firstUnit}` },
  ];

  // Conditional: Only show Q2 if operation uses two quantities
  if (secondValue !== null && secondValue !== undefined) {
    details.push({ label: 'Q2', val: `${secondValue} ${secondUnit}` });
  }
  if (targetUnit) {
    details.push({ label: 'Target', val: targetUnit });
  }
  if (createdAt) {
    details.push({ label: 'Date', val: formatDate(createdAt) });
  }

  // Add each detail to body
  details.forEach(({ label, val }) => {
    const row = document.createElement('div');
    row.className = 'history-detail';
    row.innerHTML = `
      <span class="history-detail-label">${label}</span>
      <span class="history-detail-val">${val}</span>
    `;
    body.appendChild(row);
  });

  // Show result if available
  if (resultValue !== '' && resultValue !== null && resultValue !== undefined) {
    const res = document.createElement('div');
    res.className = 'history-result';
    res.textContent = `Result: ${resultValue}${resultUnit ? ' ' + resultUnit : ''}`;
    body.appendChild(res);
  }

  card.appendChild(body);
  return card;
}

// ═════════════════════════════════════════════════════
// UI HELPERS: Loading, empty, error states
// ═════════════════════════════════════════════════════

/**
 * Show/hide loading spinner
 * @param {boolean} show
 */
function showHistoryLoading(show) {
  document.getElementById('history-loading').classList.toggle('hidden', !show);
}

/**
 * Show error message
 * @param {string} msg - Error message (empty string hides)
 */
function showHistoryError(msg) {
  const el = document.getElementById('history-error');
  el.textContent = msg;
  el.classList.toggle('hidden', !msg);
}

// ═════════════════════════════════════════════════════
// DATE FORMATTING: Human-readable date/time
// ═════════════════════════════════════════════════════

/**
 * Format ISO date string to human-readable format
 * 
 * @param {string} iso - ISO date string (e.g., '2024-12-15T10:30:00Z')
 * @returns {string} Formatted date (e.g., 'Dec 15, 2024, 10:30 AM')
 */
function formatDate(iso) {
  try {
    // Intl.DateTimeFormat: Formats dates based on locale
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',  // Dec 15, 2024
      timeStyle: 'short',   // 10:30 AM
    }).format(new Date(iso));
  } catch {
    return iso;  // Return original if formatting fails
  }
}
