from flask import Blueprint, render_template, request, render_template_string
from app.models.flashcard import FlashcardSet
from app.models.user import User

main = Blueprint('main', __name__)

@main.route('/')
def home():
    try:
        # Get featured/popular flashcard sets
        featured_sets = FlashcardSet.query.filter_by(is_public=True).limit(6).all()
        total_users = User.query.count()
        total_sets = FlashcardSet.query.count()
        
        return render_template('home.html', 
                             featured_sets=featured_sets,
                             total_users=total_users,
                             total_sets=total_sets)
    except:
        # Fallback template if home.html doesn't exist
        return render_template_string('''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Quizlet Clone</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <h1>🎓 Quizlet Clone</h1>
                <p>Welcome to the flashcard study application!</p>
                <p>Users: {{ total_users }} | Sets: {{ total_sets }}</p>
                <div class="alert alert-info">
                    <p>App is running successfully on Vercel!</p>
                    <p><a href="/test">Test Route</a> | <a href="/auth/login">Login</a></p>
                </div>
            </div>
        </body>
        </html>
        ''', total_users=User.query.count(), total_sets=FlashcardSet.query.count())

@main.route('/test')
def test_route():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Route - Quizlet Clone</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container mt-5">
            <h1>🎉 Application is Running on Vercel!</h1>
            <p>This test route confirms that Flask is working correctly.</p>
            <p>Database: In-memory SQLite</p>
            <p>Users in database: {{ user_count }}</p>
            <div class="alert alert-info">
                <strong>Sample Data Available:</strong>
                <ul>
                    <li>Admin user: admin / admin123</li>
                    <li>Student user: student / student123</li>
                    <li>Teacher user: teacher / teacher123</li>
                </ul>
            </div>
            <div class="alert alert-warning">
                <strong>Note:</strong> Data resets on each deployment since using in-memory database.
            </div>
            <p><a href="/">← Go to Home</a></p>
        </div>
    </body>
    </html>
    ''', user_count=User.query.count())

@main.route('/about')
def about():
    return render_template('about.html')

@main.route('/contact')
def contact():
    return render_template('contact.html')

@main.route('/search')
def search():
    query = request.args.get('q', '')
    sets = []
    
    if query:
        sets = FlashcardSet.query.filter(
            FlashcardSet.title.contains(query),
            FlashcardSet.is_public == True
        ).all()
    
    return render_template('search.html', sets=sets, query=query)
