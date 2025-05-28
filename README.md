# Quizlet Clone - Learning Platform

A comprehensive learning platform inspired by Quizlet, featuring flashcard creation, multiple study modes, progress tracking, and collaborative learning tools.

## Features

### 🧠 Core Learning Features
- **Flashcard Creation**: Add term-definition pairs with support for images, audio, and rich text
- **Study Modes**: Flashcard flip view, adaptive learning, matching games, multiple choice quizzes
- **Test Generator**: Auto-generate quizzes from flashcard sets with customizable question types
- **Progress Tracking**: Track correct/incorrect answers and learning progress over time

### 👩‍🏫 User & Account Management
- User registration and login with profile management
- User roles (Student, Teacher/Admin)
- Classroom management for teachers with student progress monitoring

### 🌐 Collaboration & Sharing
- Public and private flashcard sets
- Search and explore functionality
- Set sharing via links and collaborative editing

### 🔧 Customization & Accessibility
- Light/Dark mode themes
- Font size adjustments
- Text-to-speech audio playback
- Multilingual support

### 📱 Mobile & Offline Access
- Mobile-responsive design
- Offline study capabilities

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quizlet
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Environment setup**
   ```bash
   copy .env.template .env
   # Edit .env file with your configuration
   ```

6. **Initialize database**
   ```bash
   # Note: For this project, we use direct SQLite setup instead of Flask-Migrate
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   ```

7. **Run the application**
   ```bash
   python run.py
   ```

8. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
quizlet/
│
├── app/                      # Application module
│   ├── __init__.py          # Application factory
│   ├── models.py            # Database models
│   ├── routes.py            # Application routes
│   ├── static/              # Static files (CSS, JavaScript, images)
│   └── templates/           # HTML templates
│       ├── auth/            # Authentication templates
│       │   ├── login.html   # Login page
│       │   └── register.html# Registration page
│       ├── dashboard.html    # User dashboard
│       ├── flashcards.html   # Flashcard study page
│       └── 404.html         # Custom 404 error page
│
├── tests/                   # Unit and integration tests
│
├── venv/                     # Virtual environment (ignored by git)
│
├── .env                      # Environment configuration
├── .gitignore                # Git ignore file
├── requirements.txt          # Python dependencies
└── run.py                   # Application entry point
```

