from flask import Blueprint, jsonify, request
from app.models.topic import Topic, TopicStatus
from app import db
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.declaration import Declaration, Status


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
    
    response_list = []
    for topic in topics:
        supervisor_data = None
        if topic.teacher and topic.teacher.account:
            full_name_parts = topic.teacher.account.full_name.split(' ', 1)
            first_name = full_name_parts[0] if len(full_name_parts) > 0 else ''
            last_name = full_name_parts[1] if len(full_name_parts) > 1 else ''
            
            supervisor_data = {
                'id': str(topic.teacher.id),
                'firstName': first_name,
                'lastName': last_name,
                'title': topic.teacher.title.value if topic.teacher.title else 'dr',
            }
        
        response_list.append({
            'id': str(topic.id),
            'title': topic.title,
            'description': topic.description,
            'isOpen': topic.is_open,
            'creationDate': topic.creation_date.isoformat() if topic.creation_date else None,
            'supervisor': supervisor_data,
            'status': topic.status.value if topic.status else None
        })
    
    return jsonify(response_list)

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
        status=TopicStatus.OCZEKUJACY,
        is_open=True,
        teacher_id=teacher.id if teacher else None,
        topic_justification=data.get('topicJustification', '')
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

@topics_bp.route('/<int:topic_id>/declare', methods=['POST'])
def submit_declaration(topic_id):
    """
    Submit a declaration for a topic as a student.
    Request body should contain:
    {
        "student_id": int (optional, will use first student if not provided)
    }
    """
    try:
        data = request.get_json() or {}
        
        # Find the topic
        topic = Topic.query.get_or_404(topic_id)
        
        # Check if topic already has a declaration
        if topic.declaration_id:
            existing_declaration = Declaration.query.get(topic.declaration_id)
            if existing_declaration and existing_declaration.status == Status.ZLOZONA:
                return jsonify({
                    'error': 'Declaration already submitted for this topic'
                }), 400
        
        # Get student (in real app, this would come from authentication)
        student_id = data.get('student_id')
        if student_id:
            student = Student.query.get(student_id)
            if not student:
                return jsonify({'error': 'Student not found'}), 404
        else:
            # For demo purposes, use first student
            student = Student.query.first()
            if not student:
                return jsonify({'error': 'No student found'}), 404
        
        # Create or update declaration
        if topic.declaration_id:
            declaration = Declaration.query.get(topic.declaration_id)
            declaration.status = Status.ZLOZONA
            declaration.submission_date = datetime.now()
        else:
            declaration = Declaration(
                status=Status.ZLOZONA,
                submission_date=datetime.now()
            )
            db.session.add(declaration)
            db.session.flush()  # Get the declaration ID
            topic.declaration_id = declaration.id
        
        # Associate student with topic if not already
        if student.topic_id != topic_id:
            student.topic_id = topic_id
        
        db.session.commit()
        
        return jsonify({
            'message': 'Declaration submitted successfully',
            'declaration': {
                'id': declaration.id,
                'status': declaration.status.value,
                'submission_date': declaration.submission_date.isoformat()
            },
            'topic_id': topic.id,
            'student_id': student.id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to submit declaration',
            'message': str(e)
        }), 500

