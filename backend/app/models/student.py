from app import db

class Student(db.Model):
    __tablename__ = 'student'
    
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id', ondelete='CASCADE'), nullable=False, unique=True)
    index_number = db.Column(db.String(6), unique=True, nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic.id', ondelete='SET NULL'), nullable=True)
    declaration_id = db.Column(db.Integer, db.ForeignKey('declaration.id', ondelete='SET NULL', name='fk_student_declaration'), nullable=True)
    is_declaration_approved = db.Column(db.Boolean, default=False)
    
    # Relationships 
    declaration = db.relationship('Declaration', backref='student', uselist=False)
    # account - from Account
    # topic - from Topic
    
    def __repr__(self):
        return f'<Student {self.index_number}>'