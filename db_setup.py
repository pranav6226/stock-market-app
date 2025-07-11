from sqlalchemy import create_engine
from models import Base

# Create SQLite database engine
engine = create_engine('sqlite:///portfolio.db', echo=True)

# Create all tables in the database
Base.metadata.create_all(engine)  # This creates the stocks and portfolio_history tables
