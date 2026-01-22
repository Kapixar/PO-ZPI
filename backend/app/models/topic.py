import enum
from app import db
from datetime import datetime

import enum

class TopicStatus(enum.Enum):
    ZATWIERDZONY = "ZATWIERDZONY"
    ODRZUCONY = "ODRZUCONY"
    OCZEKUJACY = "OCZEKUJACY"

class Topic(db.Model):
    __tablename__ = 'topic'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_open = db.Column(db.Boolean, default=False)
    creation_date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id', ondelete='SET NULL'), nullable=True)
    declaration_id = db.Column(db.Integer, db.ForeignKey('declaration.id', ondelete='SET NULL'), nullable=True, unique=True)
    status = db.Column(db.Enum(TopicStatus), default=TopicStatus.OCZEKUJACY, nullable=False)
    topic_justification = db.Column(db.Text, nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)

    
    # Relationships
    declaration = db.relationship('Declaration', backref='topic', uselist=False)
    students = db.relationship('Student', backref='topic', lazy=True)
    # teacher - from Teacher
    
    def __repr__(self):
        return f'<Topic {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'isOpen': self.is_open,
            'isStandard': True, # Default, not in DB
            'maxMembers': 4,    # Default, not in DB
            'status': self.status.value,
            'creationDate': self.creation_date.isoformat().split('T')[0],
            'topicJustification': self.topic_justification,
            'rejectionReason': self.rejection_reason,
            'supervisor': {
                'id': self.teacher.id,
                'firstName': 'Michał', 
                'lastName': 'Ślimak',
                'title': self.teacher.title.value if self.teacher and self.teacher.title else '',
                'avatar': 'https://ui-avatars.com/api/?name=Michal+Slimak&background=random'
            } if self.teacher else None,
            'team': [{'id': s.id, 'firstName': s.first_name, 'lastName': s.last_name} for s in self.students]
        }