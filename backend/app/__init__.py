from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import config
from flask_cors import CORS 

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    with app.app_context():
        from app.models import Account, Student, Teacher, Topic, Declaration
    
    from app.routes import health_bp, topics_bp
    app.register_blueprint(health_bp)
    app.register_blueprint(topics_bp) 

    return app