/**
 * ═══════════════════════════════════════════════════════════
 * stats.js — Operation Statistics Dashboard
 * ═══════════════════════════════════════════════════════════
 * 
 * This file handles:
 * 1. Fetching operation counts from backend
 * 2. Using Promise.allSettled() for concurrent requests
 * 3. Rendering statistics as cards
 * 4. Handling loading and error states
 * 
 * Topics Covered:
 * - Promise.allSettled() (ES2020)
 * - Concurrent AJAX requests
 * - Error handling with graceful fallbacks
 * - Dynamic UI rendering
 * - CSS custom properties (--stat-color)
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ═════════════════════════════════════════════════════
// STAT OPERATIONS: Metadata for each operation
// ═════════════════════════════════════════════════════
// Defines how each operation is displayed in stats

const STAT_OPERATIONS = [
  { op: 'convert',  icon: '🔄', color: 'hsl(262,83%,68%)',  colorSolid: 'hsl(262,83%,68%)' },
  { op: 'compare',  icon: '⚖️', color: 'hsla(38,95%,60%,.3)', colorSolid: 'hsl(38,95%,60%)' },
  { op: 'add',      icon: '➕', color: 'hsla(145,63%,52%,.3)', colorSolid: 'hsl(145,63%,52%)' },
  { op: 'subtract', icon: '➖', color: 'hsla(3,85%,62%,.3)',  colorSolid: 'hsl(3,85%,62%)' },
  { op: 'divide',   icon: '➗', color: 'hsla(186,100%,55%,.3)', colorSolid: 'hsl(186,100%,55%)' },
];

// ═════════════════════════════════════════════════════
// LOAD STATS: Fetch counts for all operations
// ═════════════════════════════════════════════════════

/**
 * Load operation statistics from backend
 * Uses Promise.allSettled() to fetch all counts concurrently
 * 
 * Promise.allSettled() (ES2020):
 * - Waits for all Promises to complete (success OR failure)
 * - Returns array of { status: 'fulfilled', value: ... } or { status: 'rejected', reason: ... }
 * - Never throws, allowing graceful error handling
 * 
 * This is better than Promise.all() because one failed request won't stop others
 */
async function loadStats() {
  showStatsLoading(true);
  clearStatsError();
  document.getElementById('stats-grid').innerHTML = '';

  // ─── Fan out all requests concurrently ───
  // Each operation is fetched in parallel (not sequentially)
  // map() creates an array of Promises
  const promises = STAT_OPERATIONS.map(({ op }) =>
    api.get(CONFIG.ENDPOINTS.count + op)
       .then(data => ({ 
         op, 
         count: data?.data ?? data?.Data ?? 0, 
         ok: true 
       }))
       .catch(err  => ({ 
         op, 
         count: 0, 
         ok: false, 
         msg: err.message 
       }))
  );

  // ─── Promise.allSettled: Wait for all Promises ───
  // Each Promise is handled (success/fail) before responding
  const results = await Promise.allSettled(promises);

  showStatsLoading(false);

  // Extract values (allSettled always fulfills, never rejects)
  const stats = results.map(r => r.value);

  // Check if all requests failed
  if (stats.every(s => !s.ok)) {
    showStatsError('Could not load statistics. Ensure you are logged in and the backend is running.');
    return;
  }

  // Render stats
  renderStats(stats);
}

// ═════════════════════════════════════════════════════
// RENDER STATS: Display stat cards
// ═════════════════════════════════════════════════════

/**
 * Render all stat cards
 * 
 * @param {array} stats - Array of { op, count, ok }
 */
function renderStats(stats) {
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';

  // Use DocumentFragment for performance
  const fragment = document.createDocumentFragment();

  stats.forEach((statData, i) => {
    const meta = STAT_OPERATIONS[i];
    const card = createStatCard(meta, statData.count, statData.ok);
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

// ═════════════════════════════════════════════════════
// CREATE STAT CARD: Build card for one operation
// ═════════════════════════════════════════════════════

/**
 * Create a stat card showing operation count
 * 
 * @param {object} meta - Operation metadata { op, icon, color, colorSolid }
 * @param {number} count - Number of times operation was performed
 * @param {boolean} ok - Whether data fetch was successful
 * @returns {HTMLElement} Card element
 */
function createStatCard({ op, icon, color, colorSolid }, count, ok) {
  const card = document.createElement('div');
  card.className = 'stat-card';
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', `${op} count`);

  // ─── CSS Custom Properties (Variables) ───
  // Set color variables that CSS will use for styling
  card.style.setProperty('--stat-color', color);        // Lighter (background)
  card.style.setProperty('--stat-color-solid', colorSolid); // Solid (foreground)

  // Build card HTML
  card.innerHTML = `
    <div class="stat-icon">${icon}</div>
    <div class="stat-op">${op}</div>
    <div class="stat-count" aria-live="polite">${ok ? count : '—'}</div>
  `;

  return card;
}

// ═════════════════════════════════════════════════════
// UI HELPERS: Loading and error states
// ═════════════════════════════════════════════════════

/**
 * Show/hide loading spinner
 * @param {boolean} show
 */
function showStatsLoading(show) {
  document.getElementById('stats-loading').classList.toggle('hidden', !show);
}

/**
 * Clear error message
 */
function clearStatsError() {
  const el = document.getElementById('stats-error');
  el.textContent = '';
  el.classList.add('hidden');
}

/**
 * Show error message
 * @param {string} msg
 */
function showStatsError(msg) {
  const el = document.getElementById('stats-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}
