from app import db
from datetime import datetime
import enum

class Status(enum.Enum):
    W_PRZYGOTOWANIU = 'in preparation'
    ZLOZONA = 'złożona'

class Declaration(db.Model):
    __tablename__ = 'declaration'
    
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.Enum(Status), nullable=False, default='pending') 
    submission_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships 
    # topic - from Topic
    
    def __repr__(self):
        return f'<Declaration {self.id} - Status: {self.status}>'