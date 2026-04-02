/**
 * ═══════════════════════════════════════════════════════════
 * config.js — Application Configuration File
 * ═══════════════════════════════════════════════════════════
 * 
 * This file contains all the constants and settings used across
 * the entire application. If you need to change the backend URL,
 * add new API endpoints, or modify token keys, do it here.
 * 
 * Using Object.freeze() ensures these values cannot be accidentally modified.
 * ═══════════════════════════════════════════════════════════
 */

const CONFIG = Object.freeze({
  // Backend API base URL - Change this if your backend runs on a different port
  // Example: If backend is on port 3000: 'http://localhost:3000/api'
  BASE_URL: 'http://localhost:5000/api',

  // API Endpoints - All routes relative to BASE_URL
  ENDPOINTS: {
    // Authentication endpoints
    register: '/auth/register',   // POST: Create new user account
    login: '/auth/login',         // POST: Log in existing user

    // Calculation endpoints - Accept quantity objects and perform operations
    compare: '/Quantity/compare',     // POST: Check if two quantities are equal
    add: '/Quantity/add',             // POST: Add two quantities of same type
    subtract: '/Quantity/subtract',   // POST: Subtract two quantities
    divide: '/Quantity/divide',       // POST: Divide one quantity by another
    convert: '/Quantity/convert',     // POST: Convert quantity to different unit

    // History endpoints - Retrieve user's operation history
    history: '/Quantity/history',              // GET: All user's calculations
    historyByOp: '/Quantity/history/operation/', // GET: History filtered by operation (append operation name)

    // Stats endpoints - Get operation usage statistics
    count: '/Quantity/count/',        // GET: Count of operations (append operation name)
  },

  // LocalStorage keys - These store data in the browser's local storage
  TOKEN_KEY: 'qma_token',      // Stores JWT authentication token
  USER_KEY: 'qma_user',        // Stores logged-in user info (name, email)

  // Toast notification - How long to show notifications (in milliseconds)
  TOAST_DURATION: 4000,        // 4 seconds
});
