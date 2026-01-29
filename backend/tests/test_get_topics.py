import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime
from flask import Flask
from app.routes.topics import topics_bp
from app.models.topic import Topic, TopicStatus
from app.models.teacher import Teacher
from app.models.account import Account

"""
TESTED ENDPOINTS:

1. GET /api/topics/pending - get_pending_topics()
   Success case: Returns list of pending topics with teacher info and student count
   Empty list: Returns empty array when no pending topics exist
   Exception handling: Returns 500 error when database query fails
   

2. GET /api/topics - get_topics()
   Without filter: Returns all topics
   Empty list: Returns empty array when no topics exist
   
"""

class TestTopicsEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(topics_bp)
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True
    
    @patch('app.routes.topics.Topic')
    def test_get_pending_topics_success(self, mock_topic):
        mock_account = MagicMock(spec=Account)
        mock_account.full_name = "Dr. Jan Kowalski"
        
        mock_teacher = MagicMock(spec=Teacher)
        mock_teacher.title.value = "dr"
        mock_teacher.account = mock_account
        
        mock_topic1 = MagicMock(spec=Topic)
        mock_topic1.id = 1
        mock_topic1.title = "Machine Learning in Healthcare"
        mock_topic1.description = "Research on ML applications"
        mock_topic1.status.value = "OCZEKUJACY"
        mock_topic1.topic_justification = "Important research area"
        mock_topic1.creation_date = datetime(2024, 1, 15)
        mock_topic1.teacher = mock_teacher
        mock_topic1.students = []
        
        mock_topic2 = MagicMock(spec=Topic)
        mock_topic2.id = 2
        mock_topic2.title = "Blockchain Technology"
        mock_topic2.description = "Decentralized systems"
        mock_topic2.status.value = "OCZEKUJACY"
        mock_topic2.topic_justification = "Emerging technology"
        mock_topic2.creation_date = datetime(2024, 1, 20)
        mock_topic2.teacher = mock_teacher
        mock_topic2.students = [MagicMock(), MagicMock()]
        
        mock_topic.query.filter_by.return_value.all.return_value = [
            mock_topic1, mock_topic2
        ]
        

        response = self.client.get('/api/topics/pending')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        self.assertEqual(data['count'], 2)
        self.assertEqual(len(data['topics']), 2)
        
        self.assertEqual(data['topics'][0]['id'], 1)
        self.assertEqual(data['topics'][0]['title'], "Machine Learning in Healthcare")
        self.assertEqual(data['topics'][0]['teacher_title'], "dr")
        self.assertEqual(data['topics'][0]['teacher_full_name'], "Dr. Jan Kowalski")
        self.assertEqual(data['topics'][0]['student_count'], 0)
        
        self.assertEqual(data['topics'][1]['id'], 2)
        self.assertEqual(data['topics'][1]['student_count'], 2)
        
        mock_topic.query.filter_by.assert_called_once_with(status=TopicStatus.OCZEKUJACY)
    
    @patch('app.routes.topics.Topic')
    def test_get_pending_topics_empty_list(self, mock_topic):
        mock_topic.query.filter_by.return_value.all.return_value = []
        
        response = self.client.get('/api/topics/pending')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['count'], 0)
        self.assertEqual(data['topics'], [])
    
    
    @patch('app.routes.topics.Topic')
    def test_get_pending_topics_exception(self, mock_topic):
        mock_topic.query.filter_by.side_effect = Exception("Database connection error")
        
        response = self.client.get('/api/topics/pending')
        
        self.assertEqual(response.status_code, 500)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Failed to fetch pending topics')
        self.assertIn('message', data)
    
    @patch('app.routes.topics.Topic')
    def test_get_topics_without_filter(self, mock_topic):
        mock_topic1 = MagicMock(spec=Topic)
        mock_topic1.to_dict.return_value = {
            'id': 1,
            'title': 'Topic 1',
            'status': 'OCZEKUJACY'
        }
        
        mock_topic2 = MagicMock(spec=Topic)
        mock_topic2.to_dict.return_value = {
            'id': 2,
            'title': 'Topic 2',
            'status': 'ZATWIERDZONY'
        }
        
        mock_topic.query.all.return_value = [mock_topic1, mock_topic2]
        
        
        response = self.client.get('/api/topics')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['id'], 1)
        self.assertEqual(data[1]['id'], 2)
    
    @patch('app.routes.topics.Topic')
    def test_get_topics_empty_list(self, mock_topic):
        mock_topic.query.all.return_value = []
        
        response = self.client.get('/api/topics')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data, [])


if __name__ == '__main__':
    unittest.main()