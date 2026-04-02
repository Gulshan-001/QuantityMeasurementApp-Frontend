/**
 * ═══════════════════════════════════════════════════════════
 * app.js — App Shell & Utilities
 * ═══════════════════════════════════════════════════════════
 * 
 * This file contains core app functionality:
 * 1. Section navigation (show/hide sections)
 * 2. Toast notification system (temporary messages)
 * 3. Utility functions (HTML escaping, keyboard handling)
 * 4. App initialization
 * 
 * Topics Covered:
 * - DOM manipulation
 * - Event handling
 * - Dynamic UI rendering
 * - Conditional logic
 * - Promise-based delays
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ═════════════════════════════════════════════════════
// SECTION NAVIGATION: Show/hide main app sections
// ═════════════════════════════════════════════════════

/**
 * Switch between different sections (Calculator, History, Stats)
 * 
 * @param {string} name - Section name: 'calculator', 'history', or 'stats'
 * 
 * Does:
 * 1. Hides all sections
 * 2. Shows the requested section
 * 3. Updates navigation button active states
 * 4. Lazy-loads data (history & stats only load when clicked)
 */
function showSection(name) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Show target section
  const target = document.getElementById(`section-${name}`);
  if (target) target.classList.add('active');

  // Update nav button active states (highlight current section)
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`nav-${name}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Lazy-load data per section (loads only when section is clicked)
  if (name === 'history') loadHistory();  // Fetch from API
  if (name === 'stats')   loadStats();    // Fetch from API
}

// ═════════════════════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ═════════════════════════════════════════════════════
// Toast = Temporary popup message (bottom right corner)
// Used to show feedback (success, error, info, warning)

/**
 * Display a temporary toast notification
 * 
 * @param {'success'|'error'|'info'|'warning'} type - Toast type
 * @param {string} title - Main message
 * @param {string} [message] - Optional secondary message
 * @param {number} [duration] - How long to show (default: 4000ms)
 * 
 * Example:
 *   showToast('success', 'Saved!', 'Your data has been saved.', 3000)
 */
function showToast(type, title, message = '', duration = CONFIG.TOAST_DURATION) {
  const container = document.getElementById('toast-container');

  // Select icon for toast type
  const icons = {
    success: '✅',
    error:   '❌',
    info:    'ℹ️',
    warning: '⚠️',
  };

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  // Build HTML content (escape HTML to prevent XSS)
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] ?? 'ℹ️'}</span>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast-msg">${escapeHtml(message)}</div>` : ''}
    </div>
  `;

  // Click to dismiss toast
  toast.addEventListener('click', () => dismissToast(toast));

  // Add to container
  container.appendChild(toast);

  // Auto-dismiss after specified duration using Promise + setTimeout
  new Promise(resolve => setTimeout(resolve, duration))
    .then(() => dismissToast(toast));
}

/**
 * Remove a toast from the DOM with animation
 * @param {HTMLElement} toast - The toast element to remove
 */
function dismissToast(toast) {
  if (!toast.parentElement) return;  // Already removed
  
  // Add removing class for fade-out animation
  toast.classList.add('removing');
  
  // Remove after animation finishes
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}

// ═════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═════════════════════════════════════════════════════

/**
 * Escape HTML special characters
 * Prevents XSS attacks by encoding dangerous characters
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 * 
 * Example: escapeHtml('<script>') returns '&lt;script&gt;'
 */
function escapeHtml(str) {
  const map = { 
    '&': '&amp;', 
    '<': '&lt;', 
    '>': '&gt;', 
    '"': '&quot;', 
    "'": '&#39;' 
  };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

// ═════════════════════════════════════════════════════
// KEYBOARD ACCESSIBILITY
// ═════════════════════════════════════════════════════

/**
 * Handle keyboard shortcuts
 * - Press Escape to close result panel
 */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeResult?.();  // Close result if function exists
  }
});

// ═════════════════════════════════════════════════════
// PREVENT MOUSEWHEEL ON NUMBER INPUTS
// ═════════════════════════════════════════════════════
// Scrolling on number fields shouldn't change values

document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('wheel', e => e.preventDefault(), { passive: false });
});

// ═════════════════════════════════════════════════════
// APP INITIALIZATION
// ═════════════════════════════════════════════════════

/**
 * Run on page load
 * Initializes default state and logs ready message
 */
(function init() {
  // Set default operation and type
  selectOperation('convert');   // Default operation
  selectType?.('Length');       // Default measurement type

  // Log startup message (shows in browser console)
  console.info(
    '%c QMA Frontend Ready %c HTML + CSS + JS + AJAX',
    'background: #7c5cbf; color: #fff; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
    'background: #00d8e8; color: #000; padding: 4px 8px; border-radius: 0 4px 4px 0;'
  );
})();
