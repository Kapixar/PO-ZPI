from flask import Blueprint, jsonify, request
from app.models.topic import Topic, TopicStatus
from app import db
from app.models.teacher import Teacher


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

# Helper to get default teacher (for demo purposes)
def get_default_teacher():
    teacher = Teacher.query.first()
    if not teacher:
        # Create a dummy teacher if none exists (demo)
        from app.models.account import Account
        # assuming Account exists? Use try/except
        try:
           account = Account.query.first()
           if not account:
               account = Account(login="user", password="pw", role="TEACHER") # logic might differ
               db.session.add(account)
               db.session.commit()
           
           teacher = Teacher(account_id=account.id)
           db.session.add(teacher)
           db.session.commit()
        except:
           pass 
    return teacher

@topics_bp.route('', methods=['GET'])
def get_topics():
    supervisor_id = request.args.get('supervisor_id')
    query = Topic.query
    if supervisor_id:
        query = query.filter_by(teacher_id=supervisor_id)
    
    topics = query.all()
    return jsonify([t.to_dict() for t in topics])

@topics_bp.route('/<int:id>', methods=['GET'])
def get_topic(id):
    topic = Topic.query.get_or_404(id)
    return jsonify(topic.to_dict())

@topics_bp.route('', methods=['POST'])
def create_topic():
    data = request.get_json()
    
    teacher = get_default_teacher() # In real app, from Auth
    
    new_topic = Topic(
        title=data['title'],
        description=data.get('description', ''),
        is_standard=data.get('isStandard', True),
        max_members=data.get('maxMembers', 4),
        status=TopicStatus.OCZEKUJACY,
        is_open=True,
        teacher_id=teacher.id if teacher else None
    )
    
    db.session.add(new_topic)
    db.session.commit()
    
    return jsonify(new_topic.to_dict()), 201

@topics_bp.route('/supervisor/me', methods=['GET'])
def get_me():
    # Mocking logged-in supervisor
    teacher = get_default_teacher()
    if not teacher:
        return jsonify({'error': 'No teacher found'}), 404
        
    return jsonify({
        'id': teacher.id,
        'firstName': 'Michał',
        'lastName': 'Ślimak',
        'title': teacher.title.value if teacher.title else 'dr',
        'avatar': 'https://ui-avatars.com/api/?name=Michal+Slimak&background=random'
    })

