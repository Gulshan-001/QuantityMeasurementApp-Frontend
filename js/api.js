/**
 * ═══════════════════════════════════════════════════════════
 * api.js — HTTP Client & AJAX Layer
 * ═══════════════════════════════════════════════════════════
 * 
 * This file handles all communication with the backend API.
 * It provides:
 * 1. ApiError class - Custom error type for API failures
 * 2. apiRequest() - Core fetch wrapper (AJAX)
 * 3. Convenience methods (api.get, api.post)
 * 4. Token management functions
 * 
 * Topics Covered:
 * - Fetch API (AJAX)
 * - Promises and Async/Await
 * - Error handling (try/catch)
 * - ES6 Classes
 * - LocalStorage for token persistence
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ═════════════════════════════════════════════════════
// CUSTOM ERROR CLASS: For better error handling
// ═════════════════════════════════════════════════════
//
// Instead of generic Error, we use ApiError to track:
// - HTTP status code (401, 500, etc.)
// - Detailed error information from backend
class ApiError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name      = 'ApiError';      // Error type name
    this.statusCode = statusCode;     // HTTP status code
    this.details   = details;         // Additional error data from server
  }
}

// ═════════════════════════════════════════════════════
// CORE API REQUEST FUNCTION: Async/Await with Fetch
// ═════════════════════════════════════════════════════

/**
 * Makes an HTTP request to the backend using the Fetch API (AJAX)
 * 
 * AJAX = Asynchronous JavaScript and XML
 * Sends requests to server without reloading the page
 * 
 * @param {string} endpoint - The API route (e.g., '/auth/login')
 * @param {object} options - Request options
 *   - method: 'GET' or 'POST' (default: 'GET')
 *   - body: Object to send as JSON (converted via JSON.stringify)
 *   - auth: Whether to add JWT token (default: true)
 * @returns {Promise<any>} - Promise that resolves to response data
 * 
 * Example usage:
 *   const user = await apiRequest('/auth/login', {
 *     method: 'POST',
 *     body: { email: 'user@example.com', password: 'pass123' },
 *     auth: false
 *   });
 */
async function apiRequest(endpoint, { method = 'GET', body = null, auth = true } = {}) {
  // Construct full URL from base URL + endpoint
  const url = CONFIG.BASE_URL + endpoint;

  // ─── Build HTTP Headers ───
  const headers = { 'Content-Type': 'application/json' };

  // If auth required, add JWT token to Authorization header
  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError('Not authenticated. Please log in.', 401);
    headers['Authorization'] = `Bearer ${token}`;  // JWT format
  }

  // ─── Configure Request ───
  const requestInit = { method, headers };
  if (body) requestInit.body = JSON.stringify(body);  // Convert object to JSON string

  // ─── Send Request (Fetch API) ───
  // fetch() returns a Promise
  let response;
  try {
    response = await fetch(url, requestInit);
  } catch (networkErr) {
    // Network error: No internet, CORS blocked, server down, etc.
    throw new ApiError(
      'Cannot reach the server. Make sure the backend is running and CORS is enabled.',
      0,
      networkErr.message
    );
  }

  // ─── Parse Response Body ───
  let data;
  try {
    data = await response.json();  // Convert response to JavaScript object
  } catch {
    data = null;  // If response isn't JSON, set to null
  }

  // ─── Handle HTTP Error Status Codes ───
  // response.ok is true for 200-299 status codes
  if (!response.ok) {
    // Construct helpful error message
    const msg =
      data?.message ||
      data?.title ||
      data?.errors?.[Object.keys(data.errors)[0]]?.[0] ||
      `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(msg, response.status, data);
  }

  // Success! Return the data
  return data;
}

// ═════════════════════════════════════════════════════
// CALLBACK-BASED WRAPPER: Legacy pattern
// ═════════════════════════════════════════════════════
//
// Demonstrates Callback pattern for historical reference
// Modern code should use async/await instead
/**
 * @param {string}   endpoint
 * @param {object}   options
 * @param {Function} callback - Called with (error, data)
 */
function apiRequestCb(endpoint, options, callback) {
  apiRequest(endpoint, options)
    .then(data  => callback(null, data))
    .catch(err  => callback(err,  null));
}

// ═════════════════════════════════════════════════════
// CONVENIENCE METHODS: Simplified API calls
// ═════════════════════════════════════════════════════
//
// These functions make common requests easier to write
// Instead of: apiRequest('/path', { method: 'GET' })
// Just use: api.get('/path')
const api = {
  // GET request: Fetch data without modifying anything
  get:    (endpoint, auth = true)         => apiRequest(endpoint, { method: 'GET',  auth }),

  // POST request: Send data to create or process something
  post:   (endpoint, body, auth = true)   => apiRequest(endpoint, { method: 'POST', body, auth }),
};

// ═════════════════════════════════════════════════════
// TOKEN MANAGEMENT: LocalStorage helpers
// ═════════════════════════════════════════════════════
//
// JWT (JSON Web Token) - A string that proves user identity
// Stored in LocalStorage so user stays logged in after page reload

/**
 * Retrieves JWT token from browser's local storage
 * @returns {string|null} The token, or null if not logged in
 */
function getToken()  { 
  return localStorage.getItem(CONFIG.TOKEN_KEY); 
}

/**
 * Saves JWT token to browser's local storage
 * @param {string} t - The token string
 */
function setToken(t) { 
  localStorage.setItem(CONFIG.TOKEN_KEY, t); 
}

/**
 * Deletes JWT token from local storage (logout)
 */
function removeToken() { 
  localStorage.removeItem(CONFIG.TOKEN_KEY); 
}

// ─── User Info Helpers ───

/**
 * Retrieves user data from local storage
 * @returns {object|null} User object {email, name}, or null
 */
function getUser()   {
  try { 
    return JSON.parse(localStorage.getItem(CONFIG.USER_KEY)); 
  }
  catch { 
    return null;  // If JSON parse fails
  }
}

/**
 * Saves user data to local storage
 * @param {object} u - User object to save
 */
function setUser(u)  { 
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(u)); 
}

/**
 * Deletes user data from local storage
 */
function removeUser(){ 
  localStorage.removeItem(CONFIG.USER_KEY); 
}
