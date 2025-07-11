from flask import Blueprint, request, jsonify
from repository import add_stock, remove_stock_by_id, get_all_stocks, save_portfolio_valuation, get_portfolio_history
from database import get_db_session
from datetime import datetime

portfolio_bp = Blueprint('portfolio', __name__)

# Simulated current prices (you can extend this or integrate real API)
current_prices = {
    'AAPL': 169.00,
    'MSFT': 425.22,
    'GOOG': 173.69,
    'AMZN': 182.41,
    'TSLA': 171.05,
    'META': 502.30,
    'NVDA': 881.86,
}

@portfolio_bp.route('/stocks', methods=['POST'])
def add_stock_route():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400

    symbol = data.get('symbol')
    quantity = data.get('quantity')
    purchase_price = data.get('purchase_price')
    purchase_date = data.get('purchase_date')

    if not symbol or quantity is None or purchase_price is None or not purchase_date:
        return jsonify({'error': 'symbol, quantity, purchase_price, and purchase_date are required'}), 400

    try:
        quantity = int(quantity)
        purchase_price = float(purchase_price)
        purchase_date_obj = datetime.fromisoformat(purchase_date)
    except ValueError:
        return jsonify({'error': 'Invalid data type in inputs'}), 400

    db = get_db_session()
    try:
        stock = add_stock(db, symbol, quantity, purchase_price)
        # Update the purchase_date separately as add_stock doesn't handle it
        stock.purchase_date = purchase_date_obj
        db.commit()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'Stock added', 'stock_id': stock.id}), 201

@portfolio_bp.route('/stocks/<int:stock_id>', methods=['DELETE'])
def delete_stock_route(stock_id):
    db = get_db_session()
    try:
        success = remove_stock_by_id(db, stock_id)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    if not success:
        return jsonify({'error': 'Stock not found'}), 404
    return jsonify({'message': 'Stock removed'}), 200

@portfolio_bp.route('/portfolio/value', methods=['GET'])
def get_portfolio_value_route():
    db = get_db_session()
    stocks = get_all_stocks(db)
    total_value = 0.0
    for stock in stocks:
        current_price = current_prices.get(stock.symbol)
        if current_price is not None:
            total_value += stock.quantity * current_price

    try:
        save_portfolio_valuation(db, total_value)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'portfolio_value': total_value}), 200

@portfolio_bp.route('/portfolio/history', methods=['GET'])
def get_portfolio_history_route():
    db = get_db_session()
    records = get_portfolio_history(db)
    history_list = [{'date': r.date.isoformat(), 'total_value': r.total_value} for r in records]
    return jsonify(history_list), 200
