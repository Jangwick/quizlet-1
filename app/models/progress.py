from app import db
from datetime import datetime

class StudySession(db.Model):
    __tablename__ = 'study_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    flashcard_set_id = db.Column(db.Integer, db.ForeignKey('flashcard_sets.id'), nullable=False)
    study_mode = db.Column(db.String(50), nullable=False)  # flashcards, learn, test, match
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    total_questions = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)
    
    # Relationships
    flashcard_set = db.relationship('FlashcardSet', backref='study_sessions')
    
    def calculate_accuracy(self):
        if self.total_questions == 0:
            return 0
        return (self.correct_answers / self.total_questions) * 100

class UserProgress(db.Model):
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    flashcard_id = db.Column(db.Integer, db.ForeignKey('flashcards.id'), nullable=False)
    correct_count = db.Column(db.Integer, default=0)
    incorrect_count = db.Column(db.Integer, default=0)
    last_studied = db.Column(db.DateTime, default=datetime.utcnow)
    confidence_level = db.Column(db.Integer, default=1)  # 1-5 scale
    
    # Relationships
    flashcard = db.relationship('Flashcard', backref='progress_records')
    
    def calculate_accuracy(self):
        total = self.correct_count + self.incorrect_count
        if total == 0:
            return 0
        return (self.correct_count / total) * 100
