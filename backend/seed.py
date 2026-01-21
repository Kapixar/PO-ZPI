from app import create_app, db
from app.models.account import Account, UserType
from app.models.teacher import Teacher, Title, Position
from app.models.student import Student
from app.models.topic import Topic, TopicStatus
from app.models.declaration import Declaration, Status
from werkzeug.security import generate_password_hash
import random
from datetime import datetime, timedelta

app = create_app('development')

def reset_db():
    print("Cleaning database...")
    # Order matters due to foreign keys
    db.session.query(Declaration).delete()
    db.session.query(Topic).delete()
    db.session.query(Student).delete()
    db.session.query(Teacher).delete()
    db.session.query(Account).delete()
    db.session.commit()
    print("Database cleaned.")

def seed_data():
    print("Seeding data...")
    
    # 1. Accounts & Profiles
    
    # Administrator
    admin = Account(
        full_name="Administrator Systemu",
        login="admin",
        password=generate_password_hash("password"),
        user_type=UserType.ADMINISTRATOR
    )
    db.session.add(admin)
    
    # Coordinator
    coord = Account(
        full_name="Jan Koordynator",
        login="koordynator",
        password=generate_password_hash("password"),
        user_type=UserType.KOORDYNATOR_PRZEDMIOTU
    )
    db.session.add(coord)
    db.session.flush() # to get ID


    # KPK Member
    kpk = Account(
        full_name="Krzysztof KPK",
        login="kpk",
        password=generate_password_hash("password"),
        user_type=UserType.CZLONEK_KPK
    )
    db.session.add(kpk)
    db.session.flush()
    

    # Supervisors
    supervisors = []
    supervisor_data = [
        ("Michał Ślimak", "supervisor", Title.dr_hab, Position.PROFESOR_UCZELNI),
        ("Anna Nowak", "anna.nowak", Title.dr, Position.ADIUNKT),
        ("Piotr Kowalski", "piotr.kowalski", Title.mgr_inz, Position.ASYTSTENT),
        ("Maria Wiśniewska", "maria.wisniewska", Title.prof, Position.PROFESOR_UCZELNI),
        ("Tomasz Zieliński", "tomasz.zielinski", Title.dr_inz, Position.ADIUNKT)
    ]
    
    for name, login, title, position in supervisor_data:
        acc = Account(
            full_name=name,
            login=login,
            password=generate_password_hash("password"),
            user_type=UserType.PROWADZACY
        )
        db.session.add(acc)
        db.session.flush()
        
        teacher = Teacher(
            account_id=acc.id,
            title=title,
            position=position
        )
        db.session.add(teacher)
        supervisors.append(teacher)

    # Students
    students = []
    for i in range(1, 16):
        acc = Account(
            full_name=f"Student {i}",
            login=f"student{i}",
            password=generate_password_hash("password"),
            user_type=UserType.STUDENT
        )
        db.session.add(acc)
        db.session.flush()
        
        student = Student(
            account_id=acc.id,
            index_number=f"2{i:05d}"
        )
        db.session.add(student)
        students.append(student)

    db.session.commit()
    print("Users created.")

    # 2. Topics
    topics = []
    
    # Pre-defined topics
    topic_definitions = [
        ("Watchout - system rejestracji zdarzeń", "System do zgłaszania zagrożeń.", TopicStatus.OCZEKUJACY),
        ("System HR dla firm rozproszonych", "Aplikacja webowa do zarządzania HR.", TopicStatus.ZATWIERDZONY),
        ("Analiza sentymentu w social media", "Wykorzystanie NLP do analizy opinii.", TopicStatus.ZATWIERDZONY),
        ("Platforma e-learningowa dla seniorów", "Dostępna aplikacja do nauki.", TopicStatus.ODRZUCONY),
        ("System obsługi magazynu 3D", "Wizualizacja stanów magazynowych.", TopicStatus.OCZEKUJACY),
        ("Aplikacja mobilna dla biegaczy", "Tracking tras i statystyk.", TopicStatus.ZATWIERDZONY),
        ("Optymalizacja tras kurierskich", "Algorytmy genetyczne w logistyce.", TopicStatus.ZATWIERDZONY),
        ("System rezerwacji sal", "Zarządzanie zasobami uczelni.", TopicStatus.OCZEKUJACY),
        ("Chatbot dla dziekanatu", "Automatyzacja odpowiedzi na pytania.", TopicStatus.ODRZUCONY),
        ("Inteligentny dom - dashboard", "Panel sterowania IoT.", TopicStatus.ZATWIERDZONY),
        ("Gra edukacyjna dla dzieci", "Nauka matematyki przez zabawę.", TopicStatus.ZATWIERDZONY),
        ("System CRM dla małych firm", "Zarządzanie relacjami z klientami.", TopicStatus.OCZEKUJACY)
    ]

    for title, desc, status in topic_definitions:
        supervisor = random.choice(supervisors)
        topic = Topic(
            title=title,
            description=desc,
            status=status,
            is_open=False,
            teacher_id=supervisor.id,
            creation_date=datetime.now() - timedelta(days=random.randint(1, 30))
        )
        if status == TopicStatus.ODRZUCONY:
            topic.rejection_reason = "Temat nie spełnia wymagań formalnych."
        
        # Randomly assign justification for some
        if random.random() > 0.5:
            topic.topic_justification = "Bardzo ważny temat badawczy."

        db.session.add(topic)
        topics.append(topic)
    
    db.session.commit()
    print("Topics created.")
    
    # 3. Declarations
    
    # Assign some approved topics to student groups
    approved_topics = [t for t in topics if t.status == TopicStatus.ZATWIERDZONY]
    available_students = list(students)
    
    # Create 3 fully formed groups with declarations
    for i in range(3):
        if not approved_topics or len(available_students) < 4:
            break
            
        topic = approved_topics.pop()
        
        # Create declaration
        declaration = Declaration(
            status=Status.ZLOZONA,
            submission_date=datetime.now()
        )
        db.session.add(declaration)
        db.session.flush()
        
        # Link to topic
        topic.declaration_id = declaration.id
        topic.is_open = False # Close topic as it has a declaration
        
        # Assign 2-4 students
        group_size = random.randint(2, 4)
        for _ in range(group_size):
            if available_students:
                student = available_students.pop()
                student.topic_id = topic.id
                student.is_declaration_approved = True
    
    if approved_topics:
        pending_topic = approved_topics.pop()
        declaration = Declaration(
            status=Status.W_PRZYGOTOWANIU,
            submission_date=datetime.now()
        )
        db.session.add(declaration)
        db.session.flush()
        pending_topic.declaration_id = declaration.id
    

    db.session.commit()
    print("Declarations created.")
    print("Seeding complete.")

if __name__ == '__main__':
    with app.app_context():
        reset_db()
        seed_data()
