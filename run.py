from app import create_app, db
from app.models import User, FlashcardSet, Flashcard, StudySession, UserProgress
from datetime import datetime
from flask import render_template_string

app = create_app()

@app.context_processor
def inject_current_year():
    return {'current_year': datetime.now().year}

# Add error handlers for missing templates
@app.errorhandler(500)
def internal_error(error):
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Template Missing - Quizlet Clone</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 5px; }
            .solution { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin-top: 20px; }
            code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>🚫 Template File Missing</h1>
        <div class="error">
            <h3>Error Details:</h3>
            <p><strong>{{ error }}</strong></p>
            <p>The application is trying to load a template file that doesn't exist.</p>
        </div>
        
        <div class="solution">
            <h3>Quick Fix:</h3>
            <p>1. Create the missing template directories:</p>
            <code>mkdir app/templates/auth app/templates/flashcards app/templates/study app/templates/dashboard</code>
            
            <p>2. Create minimal template files:</p>
            <ul>
                <li><code>app/templates/base.html</code></li>
                <li><code>app/templates/home.html</code></li>
                <li><code>app/templates/auth/login.html</code></li>
                <li><code>app/templates/auth/register.html</code></li>
            </ul>
            
            <p>3. Restart the application</p>
        </div>
        
        <p><a href="/">← Go to Home</a></p>
    </body>
    </html>
    '''), 500

# Add a fallback route for testing
@app.route('/test')
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
            <p>Current year: {{ current_year }}</p>
            <p>Database: In-memory SQLite</p>
            <div class="alert alert-info">
                <strong>Sample Data Available:</strong>
                <ul>
                    <li>Demo user: demo_user / demo123</li>
                    <li>Sample flashcard set with vocabulary</li>
                </ul>
            </div>
            <div class="alert alert-warning">
                <strong>Note:</strong> Data resets on each deployment since using in-memory database.
            </div>
        </div>
    </body>
    </html>
    ''')

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'FlashcardSet': FlashcardSet,
        'Flashcard': Flashcard,
        'StudySession': StudySession,
        'UserProgress': UserProgress
    }

if __name__ == '__main__':
    print("🚀 Starting Quizlet Clone Application...")
    print("💾 Using in-memory SQLite database")
    print("🌐 Test route available at: /test")
    print("🏠 Main application at: /")
    app.run(debug=True)
