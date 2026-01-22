from flask import Blueprint, jsonify, request
from app.models.topic import Topic, TopicStatus
from app import db
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.declaration import Declaration, Status
from app.models.account import Account
from datetime import datetime


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
def handle_declaration(topic_id):
    """
    Handle declaration for a topic. Automatically creates declaration and approves based on user type.
    Request body: { "user_id": int (account id, required) }
    - If student: creates/updates their declaration and marks as approved
    - If teacher: approves the topic declaration and all students
    """
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Get the account and topic
        account = Account.query.get(user_id)
        if not account:
            return jsonify({'error': 'User not found'}), 404
        
        topic = Topic.query.get_or_404(topic_id)
        
        # Handle STUDENT declaration
        if account.student:
            student = account.student
            
            # Associate student with topic if not already
            if student.topic_id != topic_id:
                student.topic_id = topic_id
            
            # Create or update student's personal declaration
            if not student.declaration_id:
                student_declaration = Declaration(
                    status=Status.ZLOZONA,
                    submission_date=datetime.now()
                )
                db.session.add(student_declaration)
                db.session.flush()
                student.declaration_id = student_declaration.id
            else:
                student_declaration = Declaration.query.get(student.declaration_id)
                student_declaration.status = Status.ZLOZONA
                student_declaration.submission_date = datetime.now()
            
            # Mark as approved by student
            student.is_declaration_approved = True
            
            db.session.commit()
            
            return jsonify({
                'message': 'Declaration created and approved by student',
                'topic_id': topic.id,
                'user_id': user_id,
                'user_type': 'student',
                'declaration': {
                    'id': student.declaration_id,
                    'status': Status.ZLOZONA.value,
                    'is_approved': True
                }
            }), 200
        
        # Handle TEACHER declaration approval
        elif account.teacher:
            # Create topic declaration if it doesn't exist
            if not topic.teacher_declaration_id:
                topic_declaration = Declaration(
                    status=Status.ZLOZONA,
                    submission_date=datetime.now()
                )
                db.session.add(topic_declaration)
                db.session.flush()
                topic.teacher_declaration_id = topic_declaration.id
            
            # Approve all students in the topic
            approved_students = []
            for student in topic.students:
                student.is_declaration_approved = True
                approved_students.append(student.id)
            
            # Update topic status to approved
            topic.status = TopicStatus.ZATWIERDZONY
            
            db.session.commit()
            
            return jsonify({
                'message': 'Declaration approved by teacher',
                'topic_id': topic.id,
                'user_id': user_id,
                'user_type': 'teacher',
                'declaration': {
                    'id': topic.teacher_declaration_id,
                    'status': Status.ZLOZONA.value
                },
                'topic_status': TopicStatus.ZATWIERDZONY.value,
                'students_approved': approved_students
            }), 200
        
        return jsonify({'error': 'User is neither a student nor a teacher'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to handle declaration', 'message': str(e)}), 500




@topics_bp.route('/<int:topic_id>/approve', methods=['PATCH'])
def approve_topic(topic_id):
    """
    Approve a single topic.
    Changes status to ZATWIERDZONY.
    """
    try:
        topic = Topic.query.get_or_404(topic_id)
        
        topic.status = TopicStatus.ZATWIERDZONY
        # Optionally clear rejection reason if it was previously rejected
        topic.rejection_reason = None 
        
        db.session.commit()
        
        return jsonify({
            'message': 'Topic approved successfully',
            'topic': topic.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to approve topic',
            'message': str(e)
        }), 500


@topics_bp.route('/approve-bulk', methods=['PATCH'])
def approve_topics_bulk():
    """
    Approve multiple topics at once.
    Expects JSON: { "topic_ids": [1, 2, 3] }
    """
    try:
        data = request.get_json() or {}
        topic_ids = data.get('topic_ids', [])
        
        if not topic_ids:
            return jsonify({'message': 'No topics provided'}), 400

        # Update all topics with IDs in the list
        updated_count = Topic.query.filter(Topic.id.in_(topic_ids)).update(
            {Topic.status: TopicStatus.ZATWIERDZONY},
            synchronize_session=False
        )
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully approved {updated_count} topics',
            'count': updated_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to approve topics in bulk',
            'message': str(e)
        }), 500


@topics_bp.route('/<int:topic_id>/reject', methods=['PATCH'])
def reject_topic(topic_id):
    """
    Reject a single topic.
    Expects JSON: { "rejection_reason": "Reason here..." }
    Changes status to ODRZUCONY and saves the reason.
    """
    try:
        topic = Topic.query.get_or_404(topic_id)
        data = request.get_json() or {}
        
        reason = data.get('rejection_reason')
        if not reason:
            return jsonify({'error': 'Rejection reason is required'}), 400
            
        topic.status = TopicStatus.ODRZUCONY
        topic.rejection_reason = reason
        
        db.session.commit()
        
        return jsonify({
            'message': 'Topic rejected successfully',
            'topic': topic.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to reject topic',
            'message': str(e)
        }), 500
