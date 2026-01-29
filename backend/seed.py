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
    """Drops all tables and recreates them to ensure a fresh schema."""
    print("Resetting database...")
    try:
        db.drop_all()   # Deletes all tables
        db.create_all() # Creates all tables from models
        print("Database schema created.")
    except Exception as e:
        print(f"Error resetting database: {e}")

def get_max_teams_for_position(position):
    """Zwraca maksymalną liczbę zespołów dla danego stanowiska."""
    # ASYSTENT (Assistant position) has limit of 1 team
    if position == Position.ASYSTENT:
        return 1
    # ADIUNKT, PROFESOR_UCZELNI itp.
    return 2

def seed_data():
    print("Seeding data...")
    
    password_hash = generate_password_hash("password")

    # ==========================================
    # 1. ACCOUNTS & PROFILES
    # ==========================================
    
    # --- System Roles ---
    admin = Account(full_name="Administrator Systemu", login="admin", password=password_hash, user_type=UserType.ADMIN)
    coord = Account(full_name="Jan Koordynator", login="koordynator", password=password_hash, user_type=UserType.COORDINATOR)
    kpk = Account(full_name="Krzysztof KPK", login="kpk", password=password_hash, user_type=UserType.KPK_MEMBER)
    opiekun = Account(full_name="Anna Opiekun", login="opiekun", password=password_hash, user_type=UserType.PROGRAM_SUPERVISOR)
    
    db.session.add_all([admin, coord, kpk, opiekun])
    db.session.flush()

    # --- Teachers ---
    # Specific Supervisors
    acc_bh = Account(full_name="Michalina Cierpliwa", login="m.cierpliwa", password=password_hash, user_type=UserType.TEACHER)
    db.session.add(acc_bh)
    db.session.flush()
    teacher_bh = Teacher(account_id=acc_bh.id, title=Title.dr_inz, position=Position.PROFESOR_UCZELNI)
    db.session.add(teacher_bh)

    acc_ms = Account(full_name="Michał Ślimak", login="m.slimak", password=password_hash, user_type=UserType.TEACHER)
    db.session.add(acc_ms)
    db.session.flush()
    teacher_ms = Teacher(account_id=acc_ms.id, title=Title.dr_hab_inz, position=Position.ADIUNKT)
    db.session.add(teacher_ms)

    # Generic Teachers (Added more to accommodate team limits)
    teachers = [teacher_bh, teacher_ms]
    generic_teachers_data = [
        ("Jan Bąk", "j.bak", Title.dr_inz, Position.ADIUNKT),         # Limit: 2
        ("Maria Zielińska", "m.zielinska", Title.mgr, Position.ASYSTENT), # Limit: 1
        ("Tomasz Kot", "t.kot", Title.dr, Position.ADIUNKT),          # Limit: 2
        ("Beata Wąs", "b.was", Title.mgr_inz, Position.ASYSTENT),    # Limit: 1
        ("Marek Nocny", "m.nocny", Title.prof, Position.PROFESOR_UCZELNI), # Limit: 2
        ("Katarzyna Wolna", "k.wolna", Title.dr, Position.ADIUNKT)    # Limit: 2, No topics assigned
    ]

    for name, login, title, pos in generic_teachers_data:
        acc = Account(full_name=name, login=login, password=password_hash, user_type=UserType.TEACHER)
        db.session.add(acc)
        db.session.flush()
        t = Teacher(account_id=acc.id, title=title, position=pos)
        db.session.add(t)
        teachers.append(t)

    # --- Students ---
    students = []
    
    # PDF Team
    pdf_team_names = ["Franciszek Dobrzyński", "Stanisław Kaczmarek", "Kacper Knapik"]
    pdf_students = []
    for i, name in enumerate(pdf_team_names):
        login = name.lower().replace(" ", ".")
        acc = Account(full_name=name, login=login, password=password_hash, user_type=UserType.STUDENT)
        db.session.add(acc)
        db.session.flush()
        s = Student(account_id=acc.id, index_number=f"27{i:04d}")
        db.session.add(s)
        pdf_students.append(s)
        students.append(s)

    # Generic Students
    for i in range(1, 60): # Increased students pool
        acc = Account(full_name=f"Student {i}", login=f"student{i}", password=password_hash, user_type=UserType.STUDENT)
        db.session.add(acc)
        db.session.flush()
        s = Student(account_id=acc.id, index_number=f"28{i:04d}")
        db.session.add(s)
        students.append(s)

    # COMMIT TO GENERATE IDs
    db.session.commit()
    print(f"Accounts created. Total teachers: {len(teachers)}")

    # Initialize loads AFTER commit ensures IDs are generated
    teacher_loads = {t.id: 0 for t in teachers}
    
    # Mark Katarzyna Wolna (last teacher) as maxed out to keep her with 0 topics
    teacher_wolna = teachers[-1]  # Last teacher added (Katarzyna Wolna)
    teacher_loads[teacher_wolna.id] = 999  # Artificially max out to prevent random assignment

    # ==========================================
    # 2. TOPICS & TEAMS (SCENARIOS)
    # ==========================================

    # --- SCENARIO A: Standard Pending Topic ---
    # Jan Bąk (ADIUNKT, Limit 2) -> Usage: 1/2
    topic_std = Topic(
        title="Rozproszony system zarządzania personelem średnich przedsiębiorstw",
        description="Celem projektu jest stworzenie systemu ERP dedykowanego dla MŚP.",
        status=TopicStatus.OCZEKUJACY,
        is_open=False,
        teacher_id=teachers[2].id, # Jan Bąk
        creation_date=datetime.now() - timedelta(days=2),
        topic_justification=None
    )
    db.session.add(topic_std)
    # Zawsze zwiększamy licznik (chyba że przekroczylibyśmy limit, ale tu sterujemy ręcznie)
    teacher_loads[teachers[2].id] += 1
    
    db.session.flush()
    for _ in range(4): students.pop().topic_id = topic_std.id

    # --- SCENARIO B: Non-Standard Pending Topic ---
    # Michał Ślimak (ADIUNKT, Limit 2) -> Usage: 1/2
    topic_ns_small = Topic(
        title="Watchout - system rejestracji zdarzeń zagrażających bezpieczeństwu",
        description="Aplikacja mobilna i serwerowa do crowd-sourcingu.",
        status=TopicStatus.OCZEKUJACY,
        is_open=False,
        teacher_id=teacher_ms.id, 
        creation_date=datetime.now() - timedelta(days=5),
        topic_justification="Projekt wymaga wysokiej specjalizacji."
    )
    db.session.add(topic_ns_small)
    teacher_loads[teacher_ms.id] += 1

    db.session.flush()
    for _ in range(3): students.pop().topic_id = topic_ns_small.id

    # --- SCENARIO C: Non-Standard Pending Topic ---
    # Michał Ślimak (ADIUNKT, Limit 2) -> Usage: 2/2 (MAX REACHED)
    topic_ns_large = Topic(
        title="AI Present Finder - agent rekomendujący prezenty",
        description="System wykorzystujący LLM i RAG.",
        status=TopicStatus.OCZEKUJACY,
        is_open=False,
        teacher_id=teacher_ms.id,
        creation_date=datetime.now() - timedelta(days=1),
        topic_justification="Złożoność modułów AI."
    )
    db.session.add(topic_ns_large)
    teacher_loads[teacher_ms.id] += 1

    db.session.flush()
    for _ in range(5): students.pop().topic_id = topic_ns_large.id

    # --- SCENARIO D: Approved Topic ---
    # Bogumiła Hnatkowska (PROF, Limit 2) -> Usage: 1/2
    topic_approved = Topic(
        title="System zarządzania tematami ZPI",
        description="System webowy wspierający proces zgłaszania tematów.",
        status=TopicStatus.ZATWIERDZONY,
        is_open=False,
        teacher_id=teacher_bh.id,
        creation_date=datetime.now() - timedelta(days=20)
    )
    db.session.add(topic_approved)
    teacher_loads[teacher_bh.id] += 1

    db.session.flush()
    pdf_students[0].topic_id = topic_approved.id
    pdf_students[1].topic_id = topic_approved.id
    pdf_students[2].topic_id = topic_approved.id
    if students: students.pop().topic_id = topic_approved.id

    decl = Declaration(status=Status.ZLOZONA, submission_date=datetime.now() - timedelta(days=10))
    db.session.add(decl)
    db.session.flush()
    # FIX: Changed declaration_id to teacher_declaration_id
    topic_approved.teacher_declaration_id = decl.id

    # --- SCENARIO E: Rejected Topic ---
    # Maria Zielińska (ASYSTENT, Limit 1) -> Usage: 1/1 (MAX REACHED - Odrzucony też się wlicza)
    topic_rejected = Topic(
        title="Prosty sklep internetowy w PHP",
        description="Sklep z koszykiem.",
        status=TopicStatus.ODRZUCONY,
        is_open=True,
        teacher_id=teachers[3].id, # Maria Zielińska
        creation_date=datetime.now() - timedelta(days=15),
        rejection_reason="Temat zbyt trywialny."
    )
    db.session.add(topic_rejected)
    teacher_loads[teachers[3].id] += 1 # Wliczamy odrzucony
    
    db.session.flush()
    for _ in range(4): 
        if students: students.pop().topic_id = topic_rejected.id

    # --- SCENARIO F: Open Topic ---
    # Jan Bąk (ADIUNKT, Limit 2) -> Usage: 2/2 (MAX REACHED)
    topic_open = Topic(
        title="System wspomagania treningu wspinaczkowego",
        description="Analiza wideo i czujników IoT.",
        status=TopicStatus.ZATWIERDZONY,
        is_open=True,
        teacher_id=teachers[2].id, # Jan Bąk
        creation_date=datetime.now() - timedelta(days=8)
    )
    db.session.add(topic_open)
    teacher_loads[teachers[2].id] += 1

    db.session.flush()
    for _ in range(3):
        if students: students.pop().topic_id = topic_open.id

    # --- SCENARIO G: More Pending Topics (OCZEKUJACY) ---
    
    # Standard pending - Tomasz Kot (ADIUNKT, Limit 2) -> Usage: 1/2
    topic_pend_1 = Topic(
        title="System rezerwacji sal konferencyjnych",
        description="Aplikacja webowa do zarządzania rezerwacjami sal w biurowcu.",
        status=TopicStatus.OCZEKUJACY,
        is_open=False,
        teacher_id=teachers[4].id,  # Tomasz Kot
        creation_date=datetime.now() - timedelta(days=3),
        topic_justification=None
    )
    db.session.add(topic_pend_1)
    teacher_loads[teachers[4].id] += 1
    db.session.flush()
    for _ in range(4): 
        if students: students.pop().topic_id = topic_pend_1.id

    # Non-standard pending (3 students) - Tomasz Kot -> Usage: 2/2 (MAX)
    topic_pend_2 = Topic(
        title="Platforma do zarządzania wydarzeniami kulturalnymi",
        description="System rejestracji i sprzedaży biletów online.",
        status=TopicStatus.OCZEKUJACY,
        is_open=False,
        teacher_id=teachers[4].id,  # Tomasz Kot
        creation_date=datetime.now() - timedelta(days=4),
        topic_justification="Mniejszy zespół ze względu na doświadczenie członków."
    )
    db.session.add(topic_pend_2)
    teacher_loads[teachers[4].id] += 1
    db.session.flush()
    for _ in range(3): 
        if students: students.pop().topic_id = topic_pend_2.id

    # Standard pending - Marek Nocny (PROFESOR, Limit 2) -> Usage: 1/2
    topic_pend_3 = Topic(
        title="Analiza sentymentu w mediach społecznościowych",
        description="Narzędzie do analizy opinii użytkowników na podstawie wpisów.",
        status=TopicStatus.OCZEKUJACY,
        is_open=False,
        teacher_id=teachers[6].id,  # Marek Nocny
        creation_date=datetime.now() - timedelta(days=6),
        topic_justification=None
    )
    db.session.add(topic_pend_3)
    teacher_loads[teachers[6].id] += 1
    db.session.flush()
    for _ in range(4): 
        if students: students.pop().topic_id = topic_pend_3.id

    # Non-standard pending (5 students) - Marek Nocny -> Usage: 2/2 (MAX)
    topic_pend_4 = Topic(
        title="System IoT do monitorowania jakości powietrza w miastach",
        description="Sieć czujników z dashboardem do wizualizacji danych.",
        status=TopicStatus.OCZEKUJACY,
        is_open=False,
        teacher_id=teachers[6].id,  # Marek Nocny
        creation_date=datetime.now() - timedelta(days=7),
        topic_justification="Rozbudowany projekt wymagający większego zespołu."
    )
    db.session.add(topic_pend_4)
    teacher_loads[teachers[6].id] += 1
    db.session.flush()
    for _ in range(5): 
        if students: students.pop().topic_id = topic_pend_4.id

    # Standard pending - Michalina Cierpliwa -> Usage: 2/2 (MAX)
    topic_pend_5 = Topic(
        title="Aplikacja do śledzenia nawyków zdrowotnych",
        description="Mobilna aplikacja do monitorowania diety i aktywności fizycznej.",
        status=TopicStatus.OCZEKUJACY,
        is_open=False,
        teacher_id=teacher_bh.id,  # Michalina Cierpliwa
        creation_date=datetime.now() - timedelta(days=9),
        topic_justification=None
    )
    db.session.add(topic_pend_5)
    teacher_loads[teacher_bh.id] += 1
    db.session.flush()
    for _ in range(4): 
        if students: students.pop().topic_id = topic_pend_5.id

    # Non-standard pending (3 students) - Beata Wąs (ASYSTENT, Limit 1) -> Usage: 1/1 (MAX)
    topic_pend_6 = Topic(
        title="Generator dokumentacji projektowej",
        description="Narzędzie automatyzujące tworzenie dokumentacji technicznej.",
        status=TopicStatus.OCZEKUJACY,
        is_open=False,
        teacher_id=teachers[5].id,  # Beata Wąs
        creation_date=datetime.now() - timedelta(days=10),
        topic_justification="Projekt o ograniczonym zakresie dla małego zespołu."
    )
    db.session.add(topic_pend_6)
    teacher_loads[teachers[5].id] += 1
    db.session.flush()
    for _ in range(3): 
        if students: students.pop().topic_id = topic_pend_6.id

    # ==========================================
    # 3. RANDOM FILLER DATA (Respecting Limits)
    # ==========================================
    
    filler_titles = [
        ("Platforma e-learningowa dla seniorów", TopicStatus.ODRZUCONY), # Teraz to też zużywa slot!
        ("Optymalizacja tras kurierskich", TopicStatus.ZATWIERDZONY),
        ("Inteligentny dom - dashboard", TopicStatus.ZATWIERDZONY),
        ("Gra edukacyjna dla dzieci", TopicStatus.ZATWIERDZONY),
        ("System CRM dla małych firm", TopicStatus.OCZEKUJACY)
    ]

    for title, status in filler_titles:
        # Filter available supervisors based on current load and position limit
        available_teachers = []
        for t in teachers:
            limit = get_max_teams_for_position(t.position)
            current = teacher_loads[t.id]
            
            # Wszyscy muszą mieć wolny slot
            if current < limit:
                available_teachers.append(t)
        
        if not available_teachers:
            print(f"Skipping topic '{title}': No available teachers with free slots.")
            continue

        supervisor = random.choice(available_teachers)
        
        t = Topic(
            title=title,
            description="Automatycznie wygenerowany opis...",
            status=status,
            is_open=False,
            teacher_id=supervisor.id,
            creation_date=datetime.now() - timedelta(days=random.randint(1, 30))
        )
        if status == TopicStatus.ODRZUCONY:
            t.rejection_reason = "Losowy powód odrzucenia."

        db.session.add(t)
        db.session.flush()
        
        # Zawsze zwiększamy licznik
        teacher_loads[supervisor.id] += 1
        
        team_size = random.choice([3, 4, 5])
        for _ in range(team_size):
            if students:
                s = students.pop()
                s.topic_id = t.id
        
        if status == TopicStatus.ZATWIERDZONY:
            d = Declaration(status=Status.ZLOZONA, submission_date=datetime.now())
            db.session.add(d)
            db.session.flush()
            t.teacher_declaration_id = d.id

    db.session.commit()
    print("Seeding complete.")
    print("Teacher Loads:")
    for t in teachers:
        print(f" - {t.account.full_name} ({t.position.name}): {teacher_loads[t.id]}/{get_max_teams_for_position(t.position)}")

if __name__ == '__main__':
    with app.app_context():
        reset_db()
        seed_data()