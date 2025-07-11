from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Stock(Base):
    __tablename__ = 'stocks'

    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    purchase_price = Column(Float, nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Stock(id={self.id}, symbol='{self.symbol}', quantity={self.quantity}, " \
               f"purchase_price={self.purchase_price}, purchase_date={self.purchase_date})>"


class PortfolioHistory(Base):
    __tablename__ = 'portfolio_history'

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    total_value = Column(Float, nullable=False)

    def __repr__(self):
        return f"<PortfolioHistory(id={self.id}, date={self.date}, total_value={self.total_value})>"
