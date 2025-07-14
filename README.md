# Stock Market App

A React application with Python Flask backend to search and display stock market data using Yahoo Finance.

## Features

- Search for stocks by symbol (e.g., AAPL, MSFT, GOOG)
- View current stock data including price, changes, volume, and more
- Interactive charts for visualizing stock price history and performance
- Technical analysis indicators and recommendations
- Personalized watchlists (currently uses localStorage)
- Stock comparison feature
- Market news related to the selected stock
## Voice Call Improvements

We are excited to announce recent and upcoming improvements to voice call functionality within our application:

### What's Improved
- **Increased call stability:** Fewer dropped connections, improved error handling.
- **Enhanced audio quality:** Better processing for clearer conversations.
- **UI/UX Upgrades:** More intuitive controls for joining, muting, and ending calls.
- **Cross-platform Support:** Improved compatibility with modern browsers and devices.

### Usage

While primary features focus on stock data, our (future) voice call capability is designed for real-time collaboration and communication during market research sessions.

> **Note:** Voice call features are being rolled out and may not be visible to all users in the current version.

#### Troubleshooting

- Ensure your browser has microphone permissions enabled.
- For the best experience, use Chrome or Firefox and a headset.

For additional details or support, please refer to our [contribution guidelines](CONTRIBUTING.md) or open an [Issue](https://github.com/[REPO]/issues).

- Uses Yahoo Finance API for real-time data (with mock data fallback)

## Technologies Used

- **Frontend:** React, React Router, Axios, Recharts
- **Backend:** Python, Flask, Flask-CORS, requests
- **Deployment:** Netlify (Frontend), Render (Backend)

## Local Development Setup

### Prerequisites

- Node.js (v16 or later) and npm installed
- Python 3.7+ installed
- pip (Python package manager)

### Installation & Running

**1. Backend Setup:**

   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Create and activate a virtual environment (recommended):
     ```bash
     python3 -m venv venv
     # On macOS/Linux:
     source venv/bin/activate
     # On Windows:
     # venv\Scripts\activate
     ```
   - Install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Run the Flask server using Gunicorn (simulates production environment):
     ```bash
     gunicorn --bind 127.0.0.1:5001 application:application --reload
     ```
     *(Note: We use port 5001 locally to avoid conflicts with macOS AirPlay on port 5000. The `--reload` flag automatically restarts the server on code changes.)*
     The backend API will be available at `http://127.0.0.1:5001`.

**2. Frontend Setup:**

   - Open a **new terminal** and navigate to the project root directory (the one containing `package.json`):
     ```bash
     cd .. 
     ```
     *(If you are still in the backend directory)*
   - Install Node.js dependencies:
     ```bash
     npm install
     ```
   - Start the React development server:
     ```bash
     npm start
     ```
     The React app will automatically open in your browser at `http://localhost:3000`.

## Deployment

This application is configured for deployment with:
- **Frontend:** Netlify
- **Backend:** Render

**Configuration Files:**

- `netlify.toml`: Configures the frontend build (`npm run build`) and publish directory (`build`). Includes a redirect rule for client-side routing.
- `render.yaml`: Configures the backend service using Render's Blueprint spec. It specifies the Python runtime, `backend` directory, build command (`pip install -r requirements.txt`), and start command (`gunicorn --bind :$PORT application:application`).

**Environment Variables:**

Ensure the following environment variables are set in your deployment platforms:

- **Netlify:**
    - `REACT_APP_API_URL`: Set this to the URL of your deployed Render backend service (e.g., `https://your-backend-service.onrender.com`).
- **Render:**
    - `PYTHON_VERSION`: (Optional) Specify the desired Python version (e.g., `3.9`, `3.10`).
    - `FRONTEND_URL`: Set this to the URL of your deployed Netlify frontend (e.g., `https://your-netlify-app.netlify.app`). This is crucial for CORS configuration.

## Usage

1. For local development, ensure both the backend (Gunicorn) and frontend (`npm start`) are running.
2. Access the application via the frontend URL (`http://localhost:3000` locally, or your Netlify URL when deployed).
3. Search for stock symbols, view data, charts, news, and use other features.

## Note

The backend fetches data from Yahoo Finance. This is for educational and personal use only. Please review Yahoo's terms of service for any production use.

## License

MIT 
# Dashboard section
## Portfolio, Alerts, and Analytics Dashboard
Added a comprehensive dashboard feature with the following details:
- Backend API endpoints in `backend/application.py` for portfolio CRUD, stock alerts, and performance analytics
- Frontend React components in `src/components/`:
  - Dashboard.js (main container)
  - PortfolioTracker.js
  - StockAlerts.js
  - PerformanceAnalytics.js
- Page created at `src/pages/Dashboard.js` and routing updated in `src/App.js`
- Basic CSS styling added in `src/components/Dashboard.css`
- Tests added for new components in `src/__tests__/`

This feature allows users to track portfolios, subscribe to stock alerts, and view performance analytics.

---

