from app import db
from datetime import datetime
import enum

class Status(enum.Enum):
    W_PRZYGOTOWANIU = 'W_PRZYGOTOWANIU'
    ZLOZONA = 'ZLOZONA'

class Declaration(db.Model):
    __tablename__ = 'declaration'
    
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.Enum(Status), nullable=False, default=Status.W_PRZYGOTOWANIU) 
    submission_date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    
    # Relationships 
    # topic - from Topic
    
    def __repr__(self):
        return f'<Declaration {self.id} - Status: {self.status}>'