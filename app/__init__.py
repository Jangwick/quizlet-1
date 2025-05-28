from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from datetime import datetime
import os

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///quizlet.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'
    
    # User loader for Flask-Login
    from app.models.user import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Register blueprints
    from app.routes.main import main
    from app.routes.auth import auth
    from app.routes.flashcards import flashcards
    from app.routes.study import study
    from app.routes.dashboard import dashboard
    from app.routes.admin import admin
    
    app.register_blueprint(main)
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(flashcards, url_prefix='/flashcards')
    app.register_blueprint(study, url_prefix='/study')
    app.register_blueprint(dashboard, url_prefix='/dashboard')
    app.register_blueprint(admin, url_prefix='/admin')
    
    # Context processor for current year
    @app.context_processor
    def inject_current_year():
        return {'current_year': datetime.now().year}
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
