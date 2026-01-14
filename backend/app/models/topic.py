from app import db
from datetime import datetime

class Topic(db.Model):
    __tablename__ = 'topic'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_open = db.Column(db.Boolean, default=False)
    creation_date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id', ondelete='SET NULL'), nullable=True)
    declaration_id = db.Column(db.Integer, db.ForeignKey('declaration.id', ondelete='SET NULL'), nullable=True, unique=True)
    
    # Relationships
    declaration = db.relationship('Declaration', backref='topic', uselist=False)
    students = db.relationship('Student', backref='topic', lazy=True)
    # teacher - from Teacher
    
    def __repr__(self):
        return f'<Topic {self.title}>'