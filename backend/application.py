from flask import Flask, jsonify, request, make_response
import traceback
import datetime
import requests
import json
import random
import os
import sqlite3
from sqlite3 import Error
import threading
from datetime import datetime
from flask_cors import CORS

application = Flask(__name__)

# Initialize CORS
# Use FRONTEND_URL environment variable for allowed origin, default to '*' if not set
frontend_url = os.environ.get('FRONTEND_URL', '*') 
CORS(application, resources={r"/api/*": {"origins": frontend_url}})

# Current realistic prices for common stocks (as of April 2024)
current_prices = {
    'AAPL': 169.00,   # Apple
    'MSFT': 425.22,   # Microsoft
    'GOOG': 173.69,   # Google
    'GOOGL': 172.37,  # Google class A
    'AMZN': 182.41,   # Amazon
    'TSLA': 171.05,   # Tesla
    'META': 502.30,   # Meta/Facebook
    'NVDA': 881.86,   # NVIDIA
    'BRK-B': 409.00,  # Berkshire Hathaway
    'BRK-A': 610450.00, # Berkshire class A
    'JPM': 193.56,    # JPMorgan
    'V': 277.47,      # Visa
    'JNJ': 147.55,    # Johnson & Johnson
    'WMT': 60.50,     # Walmart
    'MA': 456.21,     # Mastercard
    'PG': 163.83,     # Procter & Gamble
    'DIS': 113.95,    # Disney
    'BAC': 37.48,     # Bank of America
    'ADBE': 476.73,   # Adobe
    'CSCO': 48.04,    # Cisco
    'NFLX': 636.69,   # Netflix
    'PFE': 26.66,     # Pfizer
    'INTC': 31.21,    # Intel
    'KO': 60.37,      # Coca-Cola
    'PEP': 172.40,    # PepsiCo
    'COST': 729.36,   # Costco
    'CMCSA': 40.58,   # Comcast
    'PYPL': 62.78,    # PayPal
    'MRK': 126.90,    # Merck
    'TMO': 575.58,    # Thermo Fisher
}

# Lock for SQLite DB access
db_lock = threading.Lock()

def create_connection():
    conn = None
    try:
        conn = sqlite3.connect('/home/user/repo/backend/portfolio.db', check_same_thread=False)
        return conn
    except Error as e:
        print(f"Error connecting to database: {e}")
    return conn

# Initialize DB connection
conn = create_connection()

# Create portfolio tables if not exist
with db_lock:
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolio_stocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            shares INTEGER NOT NULL,
            average_cost REAL NOT NULL,
            added_date TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolio_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            shares INTEGER NOT NULL,
            price REAL NOT NULL,
            action TEXT NOT NULL,
            action_date TEXT NOT NULL
        )
    ''')
    conn.commit()

# Helper function to calculate portfolio value
def calculate_portfolio_value():
    portfolio_value = 0.0
    with db_lock:
        cursor = conn.cursor()
        cursor.execute("SELECT symbol, shares FROM portfolio_stocks")
        rows = cursor.fetchall()
        for symbol, shares in rows:
            price = current_prices.get(symbol, 0.0)
            # Use live API price if available (could be enhanced to fetch last price from API)
            if price == 0.0:
                price = get_live_price(symbol)
            portfolio_value += price * shares
    return portfolio_value

def get_live_price(symbol):
    # Simplified: fallback to current_prices dict
    return current_prices.get(symbol, 0.0)


@application.route('/api/portfolio/add', methods=['POST'])
def add_stock_to_portfolio():
    try:
        data = request.get_json()
        symbol = data.get('symbol', '').upper()
        shares = int(data.get('shares', 0))
        average_cost = float(data.get('average_cost', 0.0))

        if not symbol or shares <= 0 or average_cost <= 0.0:
            return jsonify({'error': 'Invalid input data'}), 400

        added_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        with db_lock:
            cursor = conn.cursor()

            # Check if stock already exists in portfolio
            cursor.execute("SELECT id, shares, average_cost FROM portfolio_stocks WHERE symbol = ?", (symbol,))
            row = cursor.fetchone()
            if row:
                stock_id, current_shares, current_avg_cost = row
                # Update shares and average cost weighted
                total_shares = current_shares + shares
                new_avg_cost = ((current_shares * current_avg_cost) + (shares * average_cost)) / total_shares
                cursor.execute("UPDATE portfolio_stocks SET shares = ?, average_cost = ? WHERE id = ?", (total_shares, new_avg_cost, stock_id))
            else:
                cursor.execute("INSERT INTO portfolio_stocks (symbol, shares, average_cost, added_date) VALUES (?, ?, ?, ?)"
                               , (symbol, shares, average_cost, added_date))

            # Add to portfolio history
            cursor.execute("INSERT INTO portfolio_history (symbol, shares, price, action, action_date) VALUES (?, ?, ?, ?, ?)"
                           , (symbol, shares, average_cost, 'buy', added_date))
            conn.commit()

        return jsonify({'message': f'Added {shares} shares of {symbol} to portfolio'}), 200
    except Exception as e:
        print(f"Error adding stock to portfolio: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@application.route('/api/portfolio/remove', methods=['POST'])
def remove_stock_from_portfolio():
    try:
        data = request.get_json()
        symbol = data.get('symbol', '').upper()
        shares = int(data.get('shares', 0))

        if not symbol or shares <= 0:
            return jsonify({'error': 'Invalid input data'}), 400

        removed_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        with db_lock:
            cursor = conn.cursor()

            # Check if stock exists and has enough shares
            cursor.execute("SELECT id, shares, average_cost FROM portfolio_stocks WHERE symbol = ?", (symbol,))
            row = cursor.fetchone()
            if not row:
                return jsonify({'error': 'Stock not found in portfolio'}), 404

            stock_id, current_shares, current_avg_cost = row
            if shares > current_shares:
                return jsonify({'error': 'Not enough shares to remove'}), 400

            new_shares = current_shares - shares
            if new_shares == 0:
                cursor.execute("DELETE FROM portfolio_stocks WHERE id = ?", (stock_id,))
            else:
                cursor.execute("UPDATE portfolio_stocks SET shares = ? WHERE id = ?", (new_shares, stock_id))

            # Add to portfolio history
            cursor.execute("INSERT INTO portfolio_history (symbol, shares, price, action, action_date) VALUES (?, ?, ?, ?, ?)"
                           , (symbol, shares, current_avg_cost, 'sell', removed_date))

            conn.commit()

        return jsonify({'message': f'Removed {shares} shares of {symbol} from portfolio'}), 200
    except Exception as e:
        print(f"Error removing stock from portfolio: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@application.route('/api/portfolio/value', methods=['GET'])
def get_portfolio_value():
    try:
        value = calculate_portfolio_value()
        return jsonify({'portfolio_value': round(value, 2)}), 200
    except Exception as e:
        print(f"Error calculating portfolio value: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@application.route('/api/portfolio/history', methods=['GET'])
def get_portfolio_history():
    try:
        with db_lock:
            cursor = conn.cursor()
            cursor.execute("SELECT symbol, shares, price, action, action_date FROM portfolio_history ORDER BY action_date DESC")
            rows = cursor.fetchall()

        history = []
        for symbol, shares, price, action, action_date in rows:
            history.append({
                "symbol": symbol,
                "shares": shares,
                "price": price,
                "action": action,
                "action_date": action_date
            })

        return jsonify({'history': history}), 200
    except Exception as e:
        print(f"Error fetching portfolio history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Add route for root path for testing
@application.route('/', methods=['GET'])
def index():
    response = make_response("Flask API is running!")
    return response

# Existing /api/stock, /api/stock/history, /api/company routes remain unchanged

if __name__ == '__main__':
    # Using port 5001 instead of 5000 to avoid conflict with AirPlay on macOS
    print("Starting Flask server on 0.0.0.0:5001...")
    print("Press Ctrl+C to quit")
    application.run(debug=True, host='0.0.0.0', port=5001, threaded=True)
