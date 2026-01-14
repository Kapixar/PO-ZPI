from app import create_app, db
from app.models.account import Account, UserType
from app.models.teacher import Teacher, Title
from app.models.topic import Topic, TopicStatus, Topic

app = create_app('development')

with app.app_context():
    print("Seeding data...")
    
    # Check if supervisor exists
    account = Account.query.filter_by(login="supervisor").first()
    if not account:
        print("Creating supervisor account...")
        account = Account(
            name="Michał",
            surname="Ślimak",
            login="supervisor", 
            user_type=UserType.PROWADZACY
        )
        account.set_password("password")
        db.session.add(account)
        db.session.commit()
    
    teacher = Teacher.query.filter_by(account_id=account.id).first()
    if not teacher:
        print("Creating teacher profile...")
        teacher = Teacher(account_id=account.id, title=Title.dr_hab)
        db.session.add(teacher)
        db.session.commit()
        
    # Check/Create Topics
    if Topic.query.count() == 0:
        print("Creating topics...")
        t1 = Topic(
            title="Watchout - system rejestracji zdarzeń zagrażających bezpieczeństwu",
            description="System do zgłaszania i monitorowania zagrożeń w czasie rzeczywistym.",
            status=TopicStatus.OCZEKUJACY,
            is_open=True,
            is_standard=False,
            max_members=5,
            teacher_id=teacher.id
        )
        
        t2 = Topic(
            title="Rozproszony system zarządzania personelem średnich przedsiębiorstw",
            description="Aplikacja webowa do zarządzania HR w firmach distributed-first.",
            status=TopicStatus.ZATWIERDZONY,
            is_open=True,
            is_standard=True,
            max_members=4,
            teacher_id=teacher.id
        )
        
        db.session.add_all([t1, t2])
        db.session.commit()
        
    print("Seeding complete.")
