import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Use in-memory SQLite database
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Flask-Login settings
    REMEMBER_COOKIE_DURATION = 86400  # 1 day in seconds
    
    # Flask-WTF settings
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
