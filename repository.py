from sqlalchemy.orm import Session
from models import Stock, PortfolioHistory
from datetime import datetime

# CRUD operations and database access layer

def add_stock(db: Session, symbol: str, quantity: int, purchase_price: float):
    new_stock = Stock(symbol=symbol, quantity=quantity, purchase_price=purchase_price)
    db.add(new_stock)
    try:
        db.commit()
        db.refresh(new_stock)
        return new_stock
    except Exception as e:
        db.rollback()
        raise e


def remove_stock_by_id(db: Session, stock_id: int):
    stock = db.query(Stock).filter(Stock.id == stock_id).first()
    if stock:
        db.delete(stock)
        try:
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    return False


def remove_stock_by_symbol(db: Session, symbol: str):
    stocks = db.query(Stock).filter(Stock.symbol == symbol).all()
    if stocks:
        for stock in stocks:
            db.delete(stock)
        try:
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    return False


def get_all_stocks(db: Session):
    return db.query(Stock).all()


def save_portfolio_valuation(db: Session, total_value: float):
    record = PortfolioHistory(total_value=total_value, date=datetime.utcnow())
    db.add(record)
    try:
        db.commit()
        db.refresh(record)
        return record
    except Exception as e:
        db.rollback()
        raise e


def get_portfolio_history(db: Session):
    return db.query(PortfolioHistory).order_by(PortfolioHistory.date.desc()).all()
