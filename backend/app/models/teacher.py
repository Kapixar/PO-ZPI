from app import db
import enum

class Title(enum.Enum):
    mgr_inz = "mgr inż."
    mgr = "mgr"
    dr = "dr"
    dr_inz = "dr inż."
    dr_hab = "dr hab."
    dr_hab_inz = "dr hab. inż."
    prof = "prof."

class Position(enum.Enum):
    asystent = "Asystent"
    adiunkt = "Adiunkt"
    profesor_uczelni = "Profesor uczelni"    

class Teacher(db.Model):
    __tablename__ = 'teacher'
    
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id', ondelete='CASCADE'), nullable=False, unique=True)
    title = db.Column(db.Enum(Title), nullable=True)  
    position = db.Column(db.Enum(Position), nullable=True)
    is_declaration_approved = db.Column(db.Boolean, default=False)
    
    # Relationships
    topics = db.relationship('Topic', backref='teacher', lazy=True)
    # account - from Account
    
    def __repr__(self):
        return f'<Teacher {self.title} - Account ID: {self.account_id}>'