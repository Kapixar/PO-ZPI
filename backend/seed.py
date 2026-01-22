from app import create_app, db
from app.models.account import Account, UserType
from app.models.teacher import Teacher, Title, Position
from app.models.topic import Topic, TopicStatus, Topic

app = create_app('development')

with app.app_context():
    print("Seeding data...")
    
    # Check if supervisor exists
    account = Account.query.filter_by(login="supervisor").first()
    if not account:
        print("Creating supervisor account...")
        account = Account(
            full_name="Michał Ślimak",
            login="supervisor", 
            user_type=UserType.PROWADZACY
        )
        account.set_password("password")
        db.session.add(account)
        db.session.commit()
    
    teacher = Teacher.query.filter_by(account_id=account.id).first()
    if not teacher:
        print("Creating teacher profile...")
        teacher = Teacher(account_id=account.id, title=Title.dr_hab, position=Position.PROFESOR_UCZELNI)
        db.session.add(teacher)
        db.session.commit()
        
    # Check/Create Topics
    if Topic.query.count() == 0:
        print("Creating topics...")
        
        topics = [
            Topic(
                title="Watchout - system rejestracji zdarzeń zagrażających bezpieczeństwu",
                description="System do zgłaszania i monitorowania zagrożeń w czasie rzeczywistym. Aplikacja mobilna i webowa z geolokalizacją.",
                status=TopicStatus.OCZEKUJACY,
                is_open=True,
                teacher_id=teacher.id,
                topic_justification="Projekt realizuje potrzeby społeczne w zakresie bezpieczeństwa publicznego."
            ),
            Topic(
                title="Rozproszony system zarządzania personelem średnich przedsiębiorstw",
                description="Aplikacja webowa do zarządzania HR w firmach distributed-first. Obsługa rekrutacji, urlopów i ocen pracowniczych.",
                status=TopicStatus.ZATWIERDZONY,
                is_open=True,
                teacher_id=teacher.id,
                topic_justification="Temat odpowiada na rosnące potrzeby rynku pracy."
            ),
            Topic(
                title="System wspomagania diagnostyki medycznej oparty o sztuczną inteligencję",
                description="Aplikacja wykorzystująca uczenie maszynowe do analizy zdjęć RTG i wspomagania decyzji lekarskich.",
                status=TopicStatus.ZATWIERDZONY,
                is_open=True,
                teacher_id=teacher.id,
                topic_justification="Innowacyjne zastosowanie AI w medycynie."
            ),
            Topic(
                title="Platforma e-learningowa z interaktywnymi laboratoriami wirtualnymi",
                description="System edukacyjny umożliwiający przeprowadzanie eksperymentów w wirtualnym środowisku.",
                status=TopicStatus.ZATWIERDZONY,
                is_open=False,
                teacher_id=teacher.id
            ),
            Topic(
                title="Aplikacja do zarządzania budżetem domowym z analizą predykcyjną",
                description="Narzędzie finansowe wykorzystujące ML do przewidywania wydatków i sugerowania oszczędności.",
                status=TopicStatus.OCZEKUJACY,
                is_open=True,
                teacher_id=teacher.id,
                topic_justification="Projekt ma potencjał komercyjny i edukacyjny."
            ),
            Topic(
                title="System IoT do monitorowania jakości powietrza w miastach",
                description="Sieć czujników zbierających dane o zanieczyszczeniu powietrza z wizualizacją na mapie.",
                status=TopicStatus.ODRZUCONY,
                is_open=False,
                teacher_id=teacher.id,
                topic_justification="Projekt z zakresu IoT i ekologii.",
                rejection_reason="Zbyt duży zakres prac sprzętowych, projekt przekracza ramy programu studiów."
            ),
            Topic(
                title="Blockchain-based system głosowania elektronicznego",
                description="Bezpieczna platforma do przeprowadzania wyborów online z wykorzystaniem technologii blockchain.",
                status=TopicStatus.OCZEKUJACY,
                is_open=True,
                teacher_id=teacher.id,
                topic_justification="Innowacyjne zastosowanie blockchain w demokracji cyfrowej."
            ),
            Topic(
                title="Aplikacja mobilna do rozpoznawania roślin z wykorzystaniem Computer Vision",
                description="Narzędzie dla botaników amatorów pozwalające identyfikować gatunki roślin na podstawie zdjęć.",
                status=TopicStatus.ZATWIERDZONY,
                is_open=True,
                teacher_id=teacher.id
            ),
            Topic(
                title="System rekomendacji filmów oparty o analizę sentymentu recenzji",
                description="Platforma wykorzystująca NLP do analizy opinii użytkowników i personalizacji rekomendacji.",
                status=TopicStatus.ODRZUCONY,
                is_open=False,
                teacher_id=teacher.id,
                topic_justification="Temat z zakresu przetwarzania języka naturalnego.",
                rejection_reason="Temat jest zbyt podobny do istniejących rozwiązań komercyjnych, brak elementu innowacyjności."
            ),
            Topic(
                title="Generator muzyki AI na podstawie opisów tekstowych",
                description="Aplikacja wykorzystująca modele generatywne do tworzenia kompozycji muzycznych z promptów.",
                status=TopicStatus.OCZEKUJACY,
                is_open=True,
                teacher_id=teacher.id,
                topic_justification="Projekt łączy AI z twórczością artystyczną."
            ),
            Topic(
                title="System zarządzania flotą pojazdów dla firm kurierskich",
                description="Platforma do optymalizacji tras, monitorowania pojazdów i zarządzania dostawami w czasie rzeczywistym.",
                status=TopicStatus.ZATWIERDZONY,
                is_open=False,
                teacher_id=teacher.id
            ),
            Topic(
                title="Gamifikowana platforma do nauki programowania dla dzieci",
                description="Interaktywna gra edukacyjna ucząca podstaw kodowania poprzez rozwiązywanie zagadek.",
                status=TopicStatus.ZATWIERDZONY,
                is_open=True,
                teacher_id=teacher.id,
                topic_justification="Projekt ma wartość społeczną i edukacyjną."
            ),
            Topic(
                title="VR training simulator dla pracowników służby zdrowia",
                description="Aplikacja VR do szkolenia personelu medycznego w procedurach ratunkowych.",
                status=TopicStatus.ODRZUCONY,
                is_open=False,
                teacher_id=teacher.id,
                topic_justification="Innowacyjne wykorzystanie VR w edukacji medycznej.",
                rejection_reason="Projekt wymaga specjalistycznego sprzętu VR niedostępnego na uczelni."
            ),
            Topic(
                title="Chatbot wspierający zdrowie psychiczne oparty o terapię poznawczo-behawioralną",
                description="Asystent konwersacyjny oferujący wsparcie emocjonalne i ćwiczenia terapeutyczne.",
                status=TopicStatus.OCZEKUJACY,
                is_open=True,
                teacher_id=teacher.id,
                topic_justification="Projekt adresuje ważne potrzeby społeczne w zakresie zdrowia mentalnego."
            ),
            Topic(
                title="System wykrywania deepfake'ów w materiałach wideo",
                description="Narzędzie wykorzystujące deep learning do identyfikacji sfałszowanych treści multimedialnych.",
                status=TopicStatus.ZATWIERDZONY,
                is_open=True,
                teacher_id=teacher.id,
                topic_justification="Temat związany z cyberbezpieczeństwem i walką z dezinformacją."
            )
        ]
        
        db.session.add_all(topics)
        db.session.commit()
        print(f"Created {len(topics)} topics.")
        
    print("Seeding complete.")
