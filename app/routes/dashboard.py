from flask import Blueprint, render_template
from flask_login import login_required, current_user
from app.models.flashcard import FlashcardSet
from app.models.progress import StudySession, UserProgress
from sqlalchemy import func
from datetime import datetime, timedelta

dashboard = Blueprint('dashboard', __name__)

@dashboard.route('/')
@login_required
def index():
    # Get user statistics
    total_sets = FlashcardSet.query.filter_by(creator_id=current_user.id).count()
    
    # Recent study sessions
    recent_sessions = StudySession.query.filter_by(user_id=current_user.id)\
        .order_by(StudySession.start_time.desc()).limit(5).all()
    
    # Study streak calculation
    today = datetime.utcnow().date()
    study_dates = db.session.query(func.date(StudySession.start_time))\
        .filter_by(user_id=current_user.id)\
        .distinct().order_by(func.date(StudySession.start_time).desc()).all()
    
    streak = 0
    current_date = today
    for (study_date,) in study_dates:
        if study_date == current_date:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    # Progress data for charts
    progress_data = UserProgress.query.filter_by(user_id=current_user.id)\
        .with_entities(
            func.sum(UserProgress.correct_count).label('total_correct'),
            func.sum(UserProgress.incorrect_count).label('total_incorrect')
        ).first()
    
    return render_template('dashboard/index.html',
                         total_sets=total_sets,
                         recent_sessions=recent_sessions,
                         study_streak=streak,
                         progress_data=progress_data)
