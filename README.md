```markdown
# Stock Market App

A React application with a Python Flask backend to search and display stock market data using Yahoo Finance.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Installation & Running](#installation--running)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
- [Deployment](#deployment)
  - [Configuration Files](#configuration-files)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Note](#note)
- [License](#license)

## Features

- Search for stocks by symbol (e.g., AAPL, MSFT, GOOG)
- View current stock data including price, changes, volume, and more
- Interactive charts for visualizing stock price history and performance
- Technical analysis indicators and recommendations
- Personalized watchlists (currently uses localStorage)
- Stock comparison feature
- Market news related to the selected stock
- Uses Yahoo Finance API for real-time data (with mock data fallback)

## Technologies Used

- **Frontend:** React, React Router, Axios, Recharts
- **Backend:** Python, Flask, Flask-CORS, requests
- **Deployment:** Netlify (Frontend), Render (Backend)

## Local Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or later) and npm
- Python 3.7 or later
- pip (Python package manager)

### Installation & Running

#### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python3 -m venv venv
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   # venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask server using Gunicorn:
   ```bash
   gunicorn --bind 127.0.0.1:5001 application:application --reload
   ```
   *(Note: The backend API will be available at `http://127.0.0.1:5001`.)*

#### 2. Frontend Setup

1. Open a **new terminal** and navigate to the project root directory (the one containing `package.json`):
   ```bash
   cd ..
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   *(The React app will automatically open in your browser at `http://localhost:3000`.)*

## Deployment

This application is configured for deployment with:

- **Frontend:** Netlify
- **Backend:** Render

### Configuration Files

- **`netlify.toml`**: Configures the frontend build (`npm run build`) and publish directory (`build`). Includes a redirect rule for client-side routing.
- **`render.yaml`**: Configures the backend service using Render's Blueprint spec. It specifies the Python runtime, `backend` directory, build command (`pip install -r requirements.txt`), and start command (`gunicorn --bind :$PORT application:application`).

### Environment Variables

Ensure the following environment variables are set in your deployment platforms:

- **Netlify:**
  - `REACT_APP_API_URL`: Set this to the URL of your deployed Render backend service (e.g., `https://your-backend-service.onrender.com`).

- **Render:**
  - `PYTHON_VERSION`: (Optional) Specify the desired Python version (e.g., `3.9`, `3.10`).
  - `FRONTEND_URL`: Set this to the URL of your deployed Netlify frontend (e.g., `https://your-netlify-app.netlify.app`). This is crucial for CORS configuration.

## Usage

1. Ensure both the backend (Gunicorn) and frontend (`npm start`) are running.
2. Access the application via the frontend URL (`http://localhost:3000` locally, or your Netlify URL when deployed).
3. Use the search bar to enter stock symbols, view data, charts, news, and explore other features.

### Example Usage

- To search for Apple Inc. stock, enter `AAPL` in the search bar.
- Click on the stock to view detailed information, including price changes and market news.

## Note

The backend fetches data from Yahoo Finance. This application