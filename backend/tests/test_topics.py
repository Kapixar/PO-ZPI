"""
Unit tests for topic-related business logic in the Topics API.
Tests functions used by my-profile and pending views.

Run with: python -m pytest tests/test_topics.py -v
"""
import pytest
from app import create_app, db
from app.models.account import Account, UserType
from app.models.teacher import Teacher, Title, Position
from app.models.topic import Topic, TopicStatus
from werkzeug.security import generate_password_hash
from datetime import datetime


@pytest.fixture
def app():
    app = create_app('testing')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def setup_test_data(app):
    with app.app_context():
        password_hash = generate_password_hash("password")
        
        acc1 = Account(
            full_name="Jan Kowalski",
            login="j.kowalski",
            password=password_hash,
            user_type=UserType.TEACHER
        )
        acc2 = Account(
            full_name="Anna Nowak",
            login="a.nowak",
            password=password_hash,
            user_type=UserType.TEACHER
        )
        db.session.add_all([acc1, acc2])
        db.session.flush()
        
        teacher1 = Teacher(account_id=acc1.id, title=Title.dr, position=Position.ADIUNKT)
        teacher2 = Teacher(account_id=acc2.id, title=Title.mgr, position=Position.ASYSTENT)
        db.session.add_all([teacher1, teacher2])
        db.session.flush()
        
        topic_pending = Topic(
            title="System zarządzania projektami",
            description="Aplikacja webowa do zarządzania projektami IT",
            status=TopicStatus.OCZEKUJACY,
            is_open=False,
            teacher_id=teacher1.id,
            creation_date=datetime.now()
        )
        topic_approved = Topic(
            title="Platforma e-learningowa",
            description="System do nauki online",
            status=TopicStatus.ZATWIERDZONY,
            is_open=False,
            teacher_id=teacher1.id,
            creation_date=datetime.now()
        )
        topic_rejected = Topic(
            title="Prosta strona WWW",
            description="Strona statyczna",
            status=TopicStatus.ODRZUCONY,
            is_open=True,
            teacher_id=teacher2.id,
            rejection_reason="Temat zbyt prosty",
            creation_date=datetime.now()
        )
        topic_pending2 = Topic(
            title="Aplikacja mobilna do fitness",
            description="Aplikacja do śledzenia aktywności",
            status=TopicStatus.OCZEKUJACY,
            is_open=False,
            teacher_id=teacher2.id,
            topic_justification="Projekt wymaga 3 osób",
            creation_date=datetime.now()
        )
        
        db.session.add_all([topic_pending, topic_approved, topic_rejected, topic_pending2])
        db.session.commit()
        
        return {
            'teacher1_account_id': acc1.id,
            'teacher2_account_id': acc2.id,
            'teacher1_id': teacher1.id,
            'teacher2_id': teacher2.id,
            'topic_pending_id': topic_pending.id,
            'topic_approved_id': topic_approved.id,
            'topic_pending2_id': topic_pending2.id
        }



class TestApproveTopic:
    
    def test_approve_changes_status_to_zatwierdzony(self, client, app, setup_test_data):
        topic_id = setup_test_data['topic_pending_id']
        response = client.patch(f'/api/topics/{topic_id}/approve')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Topic approved successfully'
        assert data['topic']['status'] == 'ZATWIERDZONY'
        
        with app.app_context():
            topic = Topic.query.get(topic_id)
            assert topic.status == TopicStatus.ZATWIERDZONY
    
    def test_approve_clears_rejection_reason(self, client, app, setup_test_data):
        topic_id = setup_test_data['topic_pending_id']
        
        with app.app_context():
            topic = Topic.query.get(topic_id)
            topic.rejection_reason = "Previous rejection"
            db.session.commit()
        
        response = client.patch(f'/api/topics/{topic_id}/approve')
        assert response.status_code == 200
        
        with app.app_context():
            topic = Topic.query.get(topic_id)
            assert topic.rejection_reason is None
    
    def test_approve_nonexistent_topic_returns_404(self, client, setup_test_data):
        response = client.patch('/api/topics/99999/approve')
        assert response.status_code == 404


class TestRejectTopic:
    
    def test_reject_changes_status_to_odrzucony(self, client, app, setup_test_data):
        topic_id = setup_test_data['topic_pending2_id']
        reason = "Temat nie spełnia wymagań programowych"
        
        response = client.patch(
            f'/api/topics/{topic_id}/reject',
            json={'rejection_reason': reason}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Topic rejected successfully'
        assert data['topic']['status'] == 'ODRZUCONY'
        
        with app.app_context():
            topic = Topic.query.get(topic_id)
            assert topic.status == TopicStatus.ODRZUCONY
            assert topic.rejection_reason == reason
    
    def test_reject_requires_reason(self, client, setup_test_data):
        topic_id = setup_test_data['topic_pending2_id']
        
        response = client.patch(
            f'/api/topics/{topic_id}/reject',
            json={}
        )
        assert response.status_code == 400
        assert 'Rejection reason is required' in response.get_json()['error']
    
    def test_reject_with_empty_reason_fails(self, client, setup_test_data):
        topic_id = setup_test_data['topic_pending2_id']
        
        response = client.patch(
            f'/api/topics/{topic_id}/reject',
            json={'rejection_reason': ''}
        )
        assert response.status_code == 400
    
    def test_reject_nonexistent_topic_returns_404(self, client, setup_test_data):
        response = client.patch(
            '/api/topics/99999/reject',
            json={'rejection_reason': 'Some reason'}
        )
        assert response.status_code == 404


class TestBulkApproveTopics:
    
    def test_bulk_approve_multiple_topics(self, client, app, setup_test_data):
        topic_ids = [
            setup_test_data['topic_pending_id'],
            setup_test_data['topic_pending2_id']
        ]
        
        response = client.patch(
            '/api/topics/approve-bulk',
            json={'topic_ids': topic_ids}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['count'] == 2
        
        with app.app_context():
            for topic_id in topic_ids:
                topic = Topic.query.get(topic_id)
                assert topic.status == TopicStatus.ZATWIERDZONY
    
    def test_bulk_approve_empty_array_returns_400(self, client, setup_test_data):
        response = client.patch(
            '/api/topics/approve-bulk',
            json={'topic_ids': []}
        )
        
        assert response.status_code == 400
        assert 'No topics provided' in response.get_json()['message']
    
    def test_bulk_approve_no_body_returns_400(self, client, setup_test_data):
        response = client.patch(
            '/api/topics/approve-bulk',
            json={}
        )
        
        assert response.status_code == 400
