from flask import Blueprint, jsonify, request
from app.models.topic import Topic, TopicStatus

topics_bp = Blueprint('topics', __name__, url_prefix='/api/topics')

@topics_bp.route('/pending', methods=['GET'])
def get_pending_topics():
    try:
        pending_topics = Topic.query.filter_by(status=TopicStatus.OCZEKUJACY).all()
        
        response_list = []
        for topic in pending_topics:
            teacher_title = None
            teacher_full_name = None
            if topic.teacher:
                teacher_title = topic.teacher.title
                teacher_full_name = topic.teacher.account.full_name

            response_list.append({
                'id': topic.id,
                'title': topic.title,
                'description': topic.description,
                'status': topic.status.value, 
                'topic_justification': topic.topic_justification,
                'creation_date': topic.creation_date.isoformat() if topic.creation_date else None,
                'teacher_title': teacher_title,
                'teacher_full_name': teacher_full_name,
                'student_count': len(topic.students)
            })
        
        return jsonify({
            'count': len(response_list),
            'topics': response_list
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch pending topics',
            'message': str(e)
        }), 500

