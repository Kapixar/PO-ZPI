from app import db
import enum

class Title(enum.Enum):
    mgr_inz = "mgr inz"
    mgr = "mgr"
    dr = "dr"
    dr_inz = "dr inz"
    dr_hab = "dr hab"
    dr_hab_inz = "dr hab inz"
    prof = "prof"

class Position(enum.Enum):
    ASYSTENT = "ASYSTENT"
    ADIUNKT = "ADIUNKT"
    PROFESOR_UCZELNI = "PROFESOR_UCZELNI"    

class Teacher(db.Model):
    __tablename__ = 'teacher'
    
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id', ondelete='CASCADE'), nullable=False, unique=True)
    title = db.Column(db.Enum(Title), nullable=False)  
    position = db.Column(db.Enum(Position), nullable=False)
    is_declaration_approved = db.Column(db.Boolean, default=False)
    
    # Relationships
    topics = db.relationship('Topic', backref='teacher', lazy=True)
    # account - from Account
    
    def __repr__(self):
        return f'<Teacher {self.title} - Account ID: {self.account_id}>'