from app import db
from werkzeug.security import generate_password_hash, check_password_hash
import enum

class UserType(enum.Enum):
    STUDENT = 'STUDENT'
    TEACHER = 'TEACHER'
    KPK_MEMBER = 'KPK_MEMBER'
    COORDINATOR = 'COORDINATOR'
    PROGRAM_SUPERVISOR = 'PROGRAM_SUPERVISOR'
    ADMIN = 'ADMIN'

class Account(db.Model):
    __tablename__ = 'account'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), nullable=False)
    login = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum(UserType), nullable=False)
    
    student = db.relationship('Student', backref='account', uselist=False)
    teacher = db.relationship('Teacher', backref='account', uselist=False)
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def __repr__(self):
        return f'<Account {self.login} - {self.user_type.value}>'