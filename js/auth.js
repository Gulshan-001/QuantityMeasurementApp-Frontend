/**
 * ═══════════════════════════════════════════════════════════
 * auth.js — Authentication & User Management
 * ═══════════════════════════════════════════════════════════
 * 
 * This file handles:
 * 1. User registration (create new account)
 * 2. User login (authenticate with email/password)
 * 3. User logout (clear session)
 * 4. Form validation
 * 5. Password visibility toggle
 * 6. Session persistence (auto-login if token exists)
 * 
 * Topics Covered:
 * - DOM manipulation
 * - Event handling (Submit forms, Click buttons)
 * - Form validation
 * - Async/Await for API calls
 * - Error handling (try/catch/finally)
 * - LocalStorage for session persistence
 * - JWT token parsing
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ═════════════════════════════════════════════════════
// DOM REFERENCES: Cache frequently accessed elements
// ═════════════════════════════════════════════════════
// Storing references avoids repeated DOM lookups
const authOverlay   = document.getElementById('auth-overlay');   // Login/Register panel
const mainApp       = document.getElementById('main-app');       // Main app (shown after login)
const loginForm     = document.getElementById('login-form');     // Login form element
const registerForm  = document.getElementById('register-form');  // Register form element
const userGreeting  = document.getElementById('user-greeting');  // "Hi, Username" text

// ═════════════════════════════════════════════════════
// TAB SWITCHING: Toggle between Login and Register
// ═════════════════════════════════════════════════════

/**
 * Switch between Login and Register tabs
 * @param {string} tab - Either 'login' or 'register'
 * 
 * Example: switchTab('register') shows the register form
 */
function switchTab(tab) {
  const isLogin = tab === 'login';

  // Update tab button active states
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);

  // Update panel visibility
  document.getElementById('panel-login').classList.toggle('active', isLogin);
  document.getElementById('panel-register').classList.toggle('active', !isLogin);

  // Clear any previous errors when switching tabs
  clearAuthErrors();
}

/**
 * Clear all error messages and validation styling from forms
 */
function clearAuthErrors() {
  // Clear error message divs
  ['login-error', 'register-error', 'register-success'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { 
      el.textContent = ''; 
      el.classList.add('hidden'); 
    }
  });
  
  // Clear individual field error messages
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  
  // Remove validation classes (red border, green border)
  document.querySelectorAll('input').forEach(el => {
    el.classList.remove('is-invalid', 'is-valid');
  });
}

// ═════════════════════════════════════════════════════
// FIELD VALIDATION: Check user input before sending
// ═════════════════════════════════════════════════════

/**
 * Validates a form field against validation rules
 * Shows error message if validation fails
 * 
 * @param {HTMLInputElement} inputEl - The input field to validate
 * @param {HTMLElement} errorEl - Element to display error message
 * @param {array} rules - Array of validation rules
 *   Example: [
 *     { test: v => v.length >= 6, msg: 'At least 6 characters' },
 *     { test: v => v.includes('@'), msg: 'Must contain @' }
 *   ]
 * @returns {boolean} true if valid, false if invalid
 */
function validateField(inputEl, errorEl, rules) {
  const val = inputEl.value.trim();  // Get value and remove spaces
  
  // Test each rule
  for (const { test, msg } of rules) {
    if (!test(val)) {
      // Rule failed - show error
      errorEl.textContent = msg;
      inputEl.classList.add('is-invalid');
      inputEl.classList.remove('is-valid');
      return false;
    }
  }
  
  // All rules passed
  errorEl.textContent = '';
  inputEl.classList.remove('is-invalid');
  inputEl.classList.add('is-valid');
  return true;
}

// ═════════════════════════════════════════════════════
// PASSWORD VISIBILITY TOGGLE
// ═════════════════════════════════════════════════════

/**
 * Toggle password visibility: Switch between * and visible text
 * @param {string} inputId - ID of password input
 * @param {HTMLElement} btn - The eye button element
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const show  = input.type === 'password';
  
  // Toggle between password and text type
  input.type  = show ? 'text' : 'password';
  
  // Update button icon and label
  btn.textContent = show ? '🙈' : '👁';
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
}

// ═════════════════════════════════════════════════════
// BUTTON LOADING STATE
// ═════════════════════════════════════════════════════

/**
 * Show/hide loading spinner while request is processing
 * @param {string} btnId - Button element ID
 * @param {boolean} loading - true = show spinner, false = show text
 */
function setButtonLoading(btnId, loading) {
  const btn     = document.getElementById(btnId);
  const text    = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  
  btn.disabled  = loading;  // Disable button while loading
  text.classList.toggle('hidden', loading);
  spinner.classList.toggle('hidden', !loading);
}

// ═════════════════════════════════════════════════════
// REGISTER: Create New User Account
// ═════════════════════════════════════════════════════

/**
 * Handle register form submission
 * Validates input, sends to backend, shows success/error
 */
registerForm.addEventListener('submit', async function(e) {
  e.preventDefault();  // Prevent default form submission

  // Get form elements
  const name  = document.getElementById('reg-name');
  const email = document.getElementById('reg-email');
  const pwd   = document.getElementById('reg-password');
  const errEl = document.getElementById('register-error');
  const sucEl = document.getElementById('register-success');

  // ─── Validate Fields ───
  const nameOk  = validateField(name,  document.getElementById('reg-name-error'),  [
    { test: v => v.length >= 2, msg: 'Name must be at least 2 characters.' }
  ]);
  const emailOk = validateField(email, document.getElementById('reg-email-error'), [
    { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Enter a valid email address.' }
  ]);
  const pwdOk   = validateField(pwd,   document.getElementById('reg-password-error'), [
    { test: v => v.length >= 6, msg: 'Password must be at least 6 characters.' }
  ]);

  // If any field invalid, stop here
  if (!nameOk || !emailOk || !pwdOk) return;

  // Clear previous messages
  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  // Show loading spinner
  setButtonLoading('btn-register', true);

  try {
    // ES9 destructuring: Rename and extract values
    const { name: n, email: em, password: p } = {
      name:     name.value.trim(),
      email:    email.value.trim(),
      password: pwd.value,
    };

    // Async/Await: Wait for registration API call
    // auth=false because user not logged in yet
    await api.post(CONFIG.ENDPOINTS.register, { name: n, email: em, password: p }, false);

    // Success! Show message and switch to login
    sucEl.textContent = '✅ Account created! You can now log in.';
    sucEl.classList.remove('hidden');

    showToast('success', 'Registered!', 'Your account has been created.');
    registerForm.reset();  // Clear form inputs
    clearAuthErrors();

    // Auto-switch to login after 1.5 seconds
    setTimeout(() => switchTab('login'), 1500);

  } catch (err) {
    // Handle error
    errEl.textContent = err instanceof ApiError
      ? err.message
      : 'An unexpected error occurred.';
    errEl.classList.remove('hidden');
  } finally {
    // Always hide spinner regardless of success/failure
    setButtonLoading('btn-register', false);
  }
});

// ═════════════════════════════════════════════════════
// LOGIN: Authenticate Existing User
// ═════════════════════════════════════════════════════

/**
 * Handle login form submission
 * Validates credentials, calls API, saves token, shows main app
 */
loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Get form elements
  const email = document.getElementById('login-email');
  const pwd   = document.getElementById('login-password');
  const errEl = document.getElementById('login-error');

  // ─── Validate Fields ───
  const emailOk = validateField(email, document.getElementById('login-email-error'), [
    { test: v => v.length > 0,                                     msg: 'Email is required.' },
    { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),            msg: 'Enter a valid email.' }
  ]);
  const pwdOk = validateField(pwd, document.getElementById('login-password-error'), [
    { test: v => v.length >= 6, msg: 'Password must be at least 6 characters.' }
  ]);

  if (!emailOk || !pwdOk) return;

  errEl.classList.add('hidden');
  setButtonLoading('btn-login', true);

  // Demonstrate Promise chain (alternative to async/await)
  api.post(CONFIG.ENDPOINTS.login,
    { email: email.value.trim(), password: pwd.value },
    false  // auth=false (not authenticated yet)
  )
  .then(data => {
    // Extract JWT token from response
    const token = data.token || data.Token;
    if (!token) throw new ApiError('No token received from server.', 500);

    // Save token for future requests
    setToken(token);

    // Decode JWT to get user info (email, name)
    const payload = parseJwtPayload(token);
    const user    = { email: payload?.email ?? email.value.trim(), name: payload?.name ?? 'User' };
    
    // Save user info
    setUser(user);

    // Show main app and hide login panel
    showAuthenticatedUI(user);
    showToast('success', 'Welcome back!', `Logged in as ${user.email}`);
  })
  .catch(err => {
    // Show error message
    errEl.textContent = err instanceof ApiError
      ? err.message
      : 'Login failed. Check credentials.';
    errEl.classList.remove('hidden');
  })
  .finally(() => {
    // Always hide spinner
    setButtonLoading('btn-login', false);
  });
});

// ═════════════════════════════════════════════════════
// JWT TOKEN PARSING
// ═════════════════════════════════════════════════════

/**
 * Extract payload data from JWT token
 * JWT format: header.payload.signature (separated by dots)
 * Payload is base64url encoded JSON
 * 
 * @param {string} token - The JWT token
 * @returns {object|null} Decoded payload object
 */
function parseJwtPayload(token) {
  try {
    // Get the payload part (middle section between dots)
    const b64 = token.split('.')[1]
      .replace(/-/g, '+')  // URL-safe to standard base64
      .replace(/_/g, '/');
    
    // Decode and parse JSON
    return JSON.parse(atob(b64));  // atob() = decode base64
  } catch {
    return null;
  }
}

// ═════════════════════════════════════════════════════
// SHOW/HIDE APP
// ═════════════════════════════════════════════════════

/**
 * Show main app after successful login
 * Hide authentication panel, display greeting
 */
function showAuthenticatedUI(user) {
  authOverlay.classList.add('hidden');      // Hide login/register
  mainApp.classList.remove('hidden');       // Show calculator, history, stats

  // Show user greeting
  const displayName = user?.name || user?.email || 'User';
  userGreeting.textContent = `👋 ${displayName}`;

  // Load initial section
  showSection('calculator');
}

/**
 * Log out the user
 * Clear token, hide app, show login panel
 */
function logout() {
  removeToken();    // Delete JWT token
  removeUser();     // Delete user info
  
  mainApp.classList.add('hidden');      // Hide main app
  authOverlay.classList.remove('hidden');  // Show login panel
  
  loginForm.reset();      // Clear form inputs
  registerForm.reset();
  clearAuthErrors();      // Clear error messages
  
  switchTab('login');    // Show login tab
  showToast('info', 'Signed out', 'See you next time!');
}

// ═════════════════════════════════════════════════════
// AUTO-LOGIN: Check for existing session on page load
// ═════════════════════════════════════════════════════

/**
 * Immediately invoked function (IIFE)
 * Runs when page loads to check if user was already logged in
 * If valid token exists in localStorage, auto-login
 */
(function checkExistingSession() {
  const token = getToken();
  if (!token) return;  // No token = not logged in

  // Check if token hasn't expired
  const payload = parseJwtPayload(token);
  if (payload?.exp && Date.now() / 1000 > payload.exp) {
    // Token expired, clear it
    removeToken(); 
    removeUser(); 
    return;
  }

  // Valid token exists, auto-login user
  const user = getUser();
  if (user) showAuthenticatedUI(user);
})();
