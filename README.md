# UC19-HTML, CSS, JS FRONTEND

## 📊 Project Overview

**Quantity Measurement App** is a web-based application for converting, comparing, and performing calculations on physical quantities (Length, Weight, Volume, Temperature) with user authentication and operation history.

## ✨ Features

- **User Authentication**: Login & registration with JWT tokens
- **Unit Conversion**: Length, Weight, Volume, Temperature
- **5 Operations**: Convert, Compare, Add, Subtract, Divide
- **Operation History**: Track all past calculations
- **Statistics Dashboard**: View operation counts
- **Responsive Design**: Works on desktop and mobile

## 🏗️ Project Structure

```
├── index.html          # Main HTML with app sections
├── css/styles.css      # Dark theme, Grid, Flexbox, Responsive
├── js/
│   ├── config.js       # API endpoints & settings
│   ├── api.js          # Fetch/AJAX wrapper
│   ├── auth.js         # Login, Register, Logout
│   ├── app.js          # Navigation & Toast notifications
│   ├── calculator.js   # Calculation logic & form handling
│   ├── units.js        # Unit definitions & management
│   ├── history.js      # History display & filtering
│   └── stats.js        # Statistics display
        
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Backend API running on `http://localhost:5000/api`

### Setup
1. Update API base URL in `js/config.js` if needed:
   ```javascript
   BASE_URL: 'http://localhost:5000/api'  // Change port if different
   ```
2. Open `index.html` in a web browser
3. Register a new account or login

## 📖 Key Files

| File | Purpose |
|------|---------|
| `index.html` | Authentication overlay, Header, Calculator, History, Stats sections |
| `config.js` | API endpoints, Settings, LocalStorage keys |
| `api.js` | HTTP requests, Error handling, Token management |
| `auth.js` | Login/Register forms, JWT token parsing |
| `calculator.js` | Operation selection, Form validation, AJAX submission |
| `units.js` | Unit definitions (Length, Weight, Volume, Temperature) |
| `history.js` | Fetch & display operation history with filtering |
| `stats.js` | Load operation counts using Promise.allSettled() |
| `app.js` | Section navigation, Toast notifications |

## 🔄 How It Works

1. **Authentication**: User logs in → JWT token saved to localStorage
2. **Calculator**: User selects type → operation → values → submits
3. **Validation**: Form checks all required fields
4. **Submission**: Sends request to backend via AJAX with JWT token
5. **Result**: Displays formatted result or error message
6. **History**: All operations automatically saved and viewable
7. **Stats**: View count of each operation type

## 🛠️ Configuration

Update `js/config.js` to change:
- API base URL (for different backend port)
- API endpoints (if backend routes differ)
- Toast duration
- Token/storage key names

## 📚 Technologies

- **HTML5**: Semantic markup, Forms, ARIA accessibility
- **CSS3**: Custom properties, Grid, Flexbox, Animations, Dark theme
- **JavaScript (ES9+)**:
  - DOM manipulation & Events
  - Async/Await & Promises
  - Fetch API (AJAX)
  - Classes & Objects
  - Destructuring & Optional chaining
  - Error handling (try/catch)

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 errors | Check backend running, verify BASE_URL in config.js |
| Login fails | Clear browser localStorage, check backend auth endpoints |
| UI not updating | Check browser console for errors, verify HTML elements exist |

---

**Type**: Educational Frontend Application | **Built with**: HTML5, CSS3, Vanilla JavaScript (ES9+)
