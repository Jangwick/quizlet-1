from app import create_app, db
from app.models.user import User
from app.models.flashcard import FlashcardSet, Flashcard
from app.models.progress import StudySession, UserProgress

# Create the Flask app instance
app = create_app()

# Initialize sample data for in-memory database
def init_sample_data():
    with app.app_context():
        # Check if data already exists
        if User.query.first():
            return
            
        # Create sample flashcard set
        sample_set = FlashcardSet(
            title='Demo Vocabulary',
            description='Sample flashcard set for testing',
            user_id=1,
            is_public=True
        )
        db.session.add(sample_set)
        db.session.commit()
        
        # Create sample flashcards
        flashcards = [
            Flashcard(front='Hello', back='Hola', set_id=1),
            Flashcard(front='Goodbye', back='Adiós', set_id=1),
            Flashcard(front='Thank you', back='Gracias', set_id=1)
        ]
        for card in flashcards:
            db.session.add(card)
        
        db.session.commit()
        print("✅ Sample data initialized")

# Initialize data when the module is imported
init_sample_data()

# Vercel entry point
def handler(request):
    return app(request.environ, lambda status, headers: None)

# For local development
if __name__ == '__main__':
    app.run(debug=True)
