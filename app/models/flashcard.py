from app import db
from datetime import datetime

class FlashcardSet(db.Model):
    __tablename__ = 'flashcard_sets'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_public = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    flashcards = db.relationship('Flashcard', backref='flashcard_set', lazy=True, cascade='all, delete-orphan')
    tags = db.relationship('Tag', secondary='flashcard_set_tags', backref='flashcard_sets')
    
    def __repr__(self):
        return f'<FlashcardSet {self.title}>'

class Flashcard(db.Model):
    __tablename__ = 'flashcards'
    
    id = db.Column(db.Integer, primary_key=True)
    term = db.Column(db.Text, nullable=False)
    definition = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255))
    audio_url = db.Column(db.String(255))
    set_id = db.Column(db.Integer, db.ForeignKey('flashcard_sets.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Flashcard {self.term}>'

class Tag(db.Model):
    __tablename__ = 'tags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    
    def __repr__(self):
        return f'<Tag {self.name}>'

# Association table for many-to-many relationship
flashcard_set_tags = db.Table('flashcard_set_tags',
    db.Column('set_id', db.Integer, db.ForeignKey('flashcard_sets.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)
