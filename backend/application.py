from flask import Flask, jsonify, request, make_response
import traceback
import datetime
import requests
import json
import random
import os
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

# Add route for root path for testing
@application.route('/', methods=['GET'])
def index():
    response = make_response("Flask API is running!")
    return response

@application.route('/api/stock', methods=['GET', 'OPTIONS'])
def get_stock_data():
    # Print debugging info
    print(f"Received request for: {request.url}")
    print(f"Method: {request.method}")
    
    try:
        # Get the stock symbol from the query parameters
        symbol = request.args.get('symbol', 'AAPL').upper()  # Default to AAPL if not provided
        print(f"Looking up symbol: {symbol}")
        
        # Direct HTTP request to Yahoo Finance API
        try:
            # Yahoo Finance API URL
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
            
            # Add parameters for data we want
            params = {
                "region": "US",
                "lang": "en-US",
                "includePrePost": "false",
                "interval": "1d",
                "range": "1d",
                "corsDomain": "finance.yahoo.com",
                ".tsrc": "finance"
            }
            
            # Make the request with proper headers
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
            }
            
            print(f"Requesting data from Yahoo Finance for {symbol}")
            response = requests.get(url, params=params, headers=headers, timeout=5)
            
            # Check if the request was successful
            if response.status_code == 200:
                data = response.json()
                
                # Check if we have valid data
                if data and 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
                    result = data['chart']['result'][0]
                    quote = result['indicators']['quote'][0]
                    
                    # Get meta data
                    meta = result['meta']
                    timestamp = result['timestamp'][-1]  # Latest timestamp
                    
                    # Get price data
                    current_price = meta.get('regularMarketPrice', 0)
                    previous_close = meta.get('previousClose', current_price * 0.99)
                    
                    # Get data from quotes
                    if 'close' in quote and quote['close'] and quote['close'][-1] is not None:
                        close_price = quote['close'][-1]
                    else:
                        close_price = current_price
                        
                    if 'open' in quote and quote['open'] and quote['open'][-1] is not None:
                        open_price = quote['open'][-1]
                    else:
                        open_price = previous_close
                        
                    if 'high' in quote and quote['high'] and quote['high'][-1] is not None:
                        high_price = quote['high'][-1]
                    else:
                        high_price = max(current_price, open_price) * 1.01
                        
                    if 'low' in quote and quote['low'] and quote['low'][-1] is not None:
                        low_price = quote['low'][-1]
                    else:
                        low_price = min(current_price, open_price) * 0.99
                        
                    if 'volume' in quote and quote['volume'] and quote['volume'][-1] is not None:
                        volume = quote['volume'][-1]
                    else:
                        volume = 1000000
                    
                    # Calculate change
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100 if previous_close > 0 else 0
                    
                    # Format trading day
                    trading_day = datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
                    
                    response_data = {
                        "01. symbol": symbol,
                        "02. open": float(open_price),
                        "03. high": float(high_price),
                        "04. low": float(low_price),
                        "05. price": float(current_price),
                        "06. volume": int(volume),
                        "07. latest trading day": trading_day,
                        "08. previous close": float(previous_close),
                        "09. change": float(change),
                        "10. change percent": f"{change_percent:.2f}%"
                    }
                    
                    print(f"SUCCESS: Live data from Yahoo Finance for {symbol}: ${current_price}")
                    api_response = jsonify(response_data)
                    
                    return api_response
                else:
                    print(f"Invalid data format received for {symbol}")
            else:
                print(f"Failed to get data: {response.status_code}")
                
        except Exception as request_err:
            print(f"Error fetching data for {symbol}: {str(request_err)}")
        
        # Fall back to mock data as last resort
        print(f"FALLBACK: Using mock data for {symbol}")
        return get_mock_stock_data(symbol)
        
    except Exception as e:
        print(f"GENERAL ERROR: {str(e)}")
        print(traceback.format_exc())
        api_response = jsonify({"error": str(e)})
        api_response.status_code = 500
        
        return api_response

def get_mock_stock_data(symbol):
    print(f"Generating realistic mock data for {symbol}")
    import random
    import datetime
    
    # Get current price from our dictionary or generate a sensible one
    if symbol in current_prices:
        price = current_prices[symbol]
    else:
        # For unknown symbols, generate a realistic price based on first letter
        first_letter = symbol[0].upper()
        if first_letter in 'ABCDE':
            price = random.uniform(50, 200)  # Common range for many stocks
        elif first_letter in 'FGHIJ':
            price = random.uniform(30, 150)
        elif first_letter in 'KLMNO':
            price = random.uniform(40, 180)
        elif first_letter in 'PQRST':
            price = random.uniform(35, 160)
        else:
            price = random.uniform(25, 120)
    
    # Create realistic market behavior
    # Usually open, high, low are within 1-2% of closing price
    open_price = price * (1 + random.uniform(-0.01, 0.01))
    high_price = max(price, open_price) * (1 + random.uniform(0.001, 0.015))
    low_price = min(price, open_price) * (1 - random.uniform(0.001, 0.015))
    
    # Previous close - typical daily movement is 0.5-1.5%
    daily_change_percent = random.uniform(-1.5, 1.5)
    previous_close = price / (1 + (daily_change_percent / 100))
    
    # Calculate change from previous close
    change = price - previous_close
    change_percent = (change / previous_close) * 100
    
    # Generate realistic volume based on stock price
    if price < 50:
        volume = random.randint(5000000, 15000000)
    elif price < 200:
        volume = random.randint(2000000, 8000000)
    elif price < 500:
        volume = random.randint(1000000, 5000000)
    elif price < 1000:
        volume = random.randint(500000, 2000000)
    else:
        volume = random.randint(50000, 500000)
    
    # Create mock data
    data = {
        "01. symbol": symbol,
        "02. open": round(open_price, 2),
        "03. high": round(high_price, 2),
        "04. low": round(low_price, 2),
        "05. price": round(price, 2),
        "06. volume": volume,
        "07. latest trading day": datetime.datetime.now().strftime('%Y-%m-%d'),
        "08. previous close": round(previous_close, 2),
        "09. change": round(change, 2),
        "10. change percent": f"{change_percent:.2f}%"
    }
    
    print(f"Generated realistic mock data for {symbol}: ${round(price, 2)}")
    response = jsonify(data)
    return response

@application.route('/api/stock/history', methods=['GET', 'OPTIONS'])
def get_stock_history():
    # Print debugging info
    print(f"Received history request for: {request.url}")
    print(f"Method: {request.method}")
    
    try:
        symbol = request.args.get('symbol', 'AAPL').upper()
        period = request.args.get('period', '1mo') # e.g., 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
        interval = request.args.get('interval', '1d') # e.g., 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
        print(f"Looking up history for: {symbol}, period: {period}, interval: {interval}")
        
        # Direct HTTP request to Yahoo Finance API for historical data
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
            params = {
                "region": "US",
                "lang": "en-US",
                "includePrePost": "false",
                "interval": interval,
                "range": period,
                "corsDomain": "finance.yahoo.com",
                ".tsrc": "finance"
            }
            headers = {
                "User-Agent": "Mozilla/5.0"
            }
            
            print(f"Requesting history from Yahoo Finance for {symbol}")
            response = requests.get(url, params=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data and 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
                    result = data['chart']['result'][0]
                    timestamps = result['timestamp']
                    prices = result['indicators']['quote'][0]['close']
                    volumes = result['indicators']['quote'][0]['volume']
                    
                    # Format data
                    historical_data = []
                    for i in range(len(timestamps)):
                        # Skip entries with missing price data
                        if prices[i] is not None:
                            historical_data.append({
                                "date": datetime.datetime.fromtimestamp(timestamps[i]).strftime('%Y-%m-%d'),
                                "price": prices[i],
                                "volume": volumes[i] if volumes[i] is not None else 0
                            })
                    
                    response_data = {"symbol": symbol, "data": historical_data}
                    print(f"SUCCESS: Found {len(historical_data)} history points for {symbol}")
                    api_response = jsonify(response_data)
                    
                    return api_response
                else:
                    print(f"Invalid history data format for {symbol}")
            else:
                print(f"Failed to get history data: {response.status_code}")
                
        except Exception as request_err:
            print(f"Error fetching history data for {symbol}: {str(request_err)}")
            
        # Fall back to mock data
        print(f"FALLBACK: Using mock history data for {symbol}")
        mock_response = get_mock_stock_history(symbol, period, interval)
        return mock_response

    except Exception as e:
        print(f"GENERAL HISTORY ERROR: {str(e)}")
        print(traceback.format_exc())
        api_response = jsonify({"error": str(e)})
        api_response.status_code = 500
        return api_response

def get_mock_stock_history(symbol, period='1mo', interval='1d'):
    print(f"Generating mock historical data for {symbol}, period={period}, interval={interval}")
    
    # Get current price from our dictionary or generate a sensible one
    if symbol in current_prices:
        current_price = current_prices[symbol]
    else:
        # For unknown symbols, generate a realistic price
        first_letter = symbol[0].upper()
        if first_letter in 'ABCDE':
            current_price = random.uniform(50, 200)
        elif first_letter in 'FGHIJ':
            current_price = random.uniform(30, 150)
        elif first_letter in 'KLMNO':
            current_price = random.uniform(40, 180)
        elif first_letter in 'PQRST':
            current_price = random.uniform(35, 160)
        else:
            current_price = random.uniform(25, 120)
    
    # Determine number of data points based on period
    num_points = 30  # Default for 1mo
    if period == '5d':
        num_points = 5
    elif period == '1mo':
        num_points = 30
    elif period == '3mo':
        num_points = 90
    elif period == '6mo':
        num_points = 180
    elif period == '1y':
        num_points = 365
    elif period == 'ytd':
        # Calculate days from beginning of year
        today = datetime.datetime.now()
        start_of_year = datetime.datetime(today.year, 1, 1)
        num_points = (today - start_of_year).days
    
    # Generate data with a realistic trend (generally upward with volatility)
    historical_data = []
    
    # Start with a price 5-10% lower than current for a general uptrend
    start_price = current_price * (0.9 + random.random() * 0.05)
    price = start_price
    
    today = datetime.datetime.now()
    
    for i in range(num_points):
        # Calculate date
        point_date = today - datetime.timedelta(days=(num_points - i - 1))
        date_str = point_date.strftime('%Y-%m-%d')
        
        # Small daily volatility with slight upward bias
        volatility = price * 0.02  # 2% daily movement
        change = volatility * (random.random() - 0.48)  # Slight upward bias
        
        # Apply change
        price += change
        
        # Ensure price stays positive and reasonable
        price = max(price, start_price * 0.7)
        price = min(price, start_price * 1.5)
        
        # Calculate day range (open, high, low)
        day_range = price * 0.01  # 1% intraday range
        open_price = price - day_range/2 + random.random() * day_range
        high_price = max(price, open_price) * (1 + random.random() * 0.01)
        low_price = min(price, open_price) * (1 - random.random() * 0.01)
        
        # Volume based on price
        if price < 50:
            volume = random.randint(5000000, 15000000)
        elif price < 200:
            volume = random.randint(2000000, 8000000)
        elif price < 500:
            volume = random.randint(1000000, 5000000)
        elif price < 1000:
            volume = random.randint(500000, 2000000)
        else:
            volume = random.randint(50000, 500000)
        
        # Add data point
        historical_data.append({
            "date": date_str,
            "price": round(price, 2),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "volume": volume
        })
    
    # Create the final data point as current price
    historical_data[-1]["price"] = round(current_price, 2)
    
    # Create response
    response_data = {
        "symbol": symbol,
        "period": period,
        "interval": interval,
        "data": historical_data
    }
    
    print(f"Generated {len(historical_data)} mock data points for {symbol}")
    response = jsonify(response_data)
    return response

if __name__ == '__main__':
    # Using port 5001 instead of 5000 to avoid conflict with AirPlay on macOS
    print("Starting Flask server on 0.0.0.0:5001...")
    print("Press Ctrl+C to quit")
    application.run(debug=True, host='0.0.0.0', port=5001, threaded=True) 