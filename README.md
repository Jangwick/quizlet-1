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

## Current Implementation Status

### ✅ Completed Features
- User authentication (login/register) with modern UI/UX
- Responsive base template with navigation
- Home, About, Contact, and Search pages
- Dashboard template structure with error handling
- Flashcard creation and management templates
- Study mode templates (flashcards, learn, test, match)
- Role-based navigation (Admin, Teacher, Student)
- Basic route structure with proper imports

### 🚧 In Development
- Database models implementation (User, Flashcard, Progress)
- Authentication backend with Flask-Login
- Admin panel routes and functionality
- Classroom management features
- User progress tracking system
- Real-time study modes functionality

### 📋 Planned Features
- File upload for images and audio
- Social authentication (Google, Facebook, GitHub)
- Mobile app development
- Advanced analytics and reporting
- Collaborative editing and real-time features
- Spaced repetition algorithms
- Export/import functionality

## Common Issues & Solutions

### Database-Related Errors
If you encounter `NameError: name 'db' is not defined` or similar database errors:

1. **Missing Database Models**: The application expects certain database models that may not be implemented yet
2. **Import Issues**: Some routes may be missing proper imports
3. **Database Not Initialized**: The database tables may not exist

**Quick Fix**: The application includes error handling to gracefully handle missing database components. Features that require database functionality will show placeholder data until the backend is fully implemented.

### Template Errors
- **BuildError for routes**: Some advanced features link to routes that are planned but not yet implemented
- **Missing template variables**: Templates may reference variables that aren't yet passed from routes

**Solution**: The application includes fallback logic and error handling to prevent crashes.

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

6. **Initialize database (when models are implemented)**
   ```bash
   # This will work once database models are created
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   ```

7. **Create required template directories and files**
   ```bash
   # Windows - Create directories
   mkdir app\templates\auth
   mkdir app\templates\flashcards
   mkdir app\templates\study
   mkdir app\templates\dashboard
   
   # macOS/Linux - Create directories
   mkdir -p app/templates/auth
   mkdir -p app/templates/flashcards
   mkdir -p app/templates/study
   mkdir -p app/templates/dashboard
   ```

   **Important**: Template files are already created in the repository. This step creates additional directories if needed.

8. **Run the application**
   ```bash
   python run.py
   ```

9. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Default Admin Credentials

**Note**: Admin functionality is currently in development. Once implemented, you can use these default credentials:
- **Email**: admin@quizletclone.com
- **Password**: admin123

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

## Troubleshooting

- **Missing template files**: If you encounter errors related to missing template files (e.g., `auth/login.html`), ensure that you have created the necessary template directories as outlined in the setup instructions.

- **Database initialization issues**: If you face problems with database initialization, make sure you have the correct permissions and that the SQLite file is not locked by another process.

- **Virtual environment problems**: If you experience issues with the virtual environment, try recreating it and reinstalling the dependencies.

- **Port conflicts**: If `http://localhost:5000` is not accessible, the port may be in use by another application. Either close the conflicting application or change the port in the Flask configuration.

- **File permission errors on macOS/Linux**: You might encounter permission errors when running certain commands. Prefixing the command with `sudo` may be necessary, but use it cautiously.

## Required Template Files

After creating the necessary directories, you must create the following template files:

- `app/templates/auth/login.html`: Login page template
- `app/templates/auth/register.html`: Registration page template
- `app/templates/dashboard.html`: User dashboard template
- `app/templates/flashcards.html`: Flashcard study page template
- `app/templates/404.html`: Custom 404 error page template

You can create these files using your preferred code editor or IDE. Ensure that the files are saved with the correct names and extensions in the respective directories.

