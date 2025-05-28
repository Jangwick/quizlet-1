from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.user import User
from app.models.flashcard import FlashcardSet, Flashcard
from app.models.progress import StudySession, UserProgress
from sqlalchemy import func
from datetime import datetime, timedelta

dashboard = Blueprint('dashboard', __name__)

@dashboard.route('/')
@login_required
def index():
    # Get user's basic stats
    total_sets = FlashcardSet.query.filter_by(creator_id=current_user.id).count()
    
    # Calculate study streak (simplified - days with study sessions)
    try:
        study_dates = db.session.query(func.date(StudySession.start_time))\
                        .filter(StudySession.user_id == current_user.id)\
                        .distinct().all()
        study_streak = len(study_dates) if study_dates else 0
    except Exception as e:
        # If StudySession table doesn't exist yet, default to 0
        study_streak = 0
    
    # Cards studied today (simplified)
    today = datetime.now().date()
    try:
        cards_studied_today = db.session.query(UserProgress)\
                                .filter(UserProgress.user_id == current_user.id)\
                                .filter(func.date(UserProgress.last_studied) == today)\
                                .count()
    except Exception as e:
        cards_studied_today = 0
    
    # Overall accuracy (simplified)
    try:
        progress_records = UserProgress.query.filter_by(user_id=current_user.id).all()
        if progress_records:
            total_correct = sum(p.correct_count for p in progress_records)
            total_attempts = sum(p.correct_count + p.incorrect_count for p in progress_records)
            overall_accuracy = round((total_correct / total_attempts * 100) if total_attempts > 0 else 0)
        else:
            overall_accuracy = 0
    except Exception as e:
        overall_accuracy = 0
    
    # Get recent sets (limit 6)
    try:
        recent_sets = FlashcardSet.query\
                        .filter_by(creator_id=current_user.id)\
                        .order_by(FlashcardSet.updated_at.desc())\
                        .limit(6).all()
    except Exception as e:
        recent_sets = []
    
    # Mock recent activity (since we don't have activity tracking yet)
    recent_activity = [
        {
            'type': 'study',
            'description': 'Studied Spanish Vocabulary set',
            'timestamp': datetime.now() - timedelta(hours=2)
        },
        {
            'type': 'create',
            'description': 'Created Biology Terms set',
            'timestamp': datetime.now() - timedelta(days=1)
        },
        {
            'type': 'achievement',
            'description': 'Reached 7-day study streak!',
            'timestamp': datetime.now() - timedelta(days=2)
        }
    ] if total_sets > 0 else []
    
    return render_template('dashboard/index.html',
                         total_sets=total_sets,
                         study_streak=study_streak,
                         cards_studied_today=cards_studied_today,
                         overall_accuracy=overall_accuracy,
                         recent_sets=recent_sets,
                         recent_activity=recent_activity)

def get_activity_icon(activity_type):
    """Helper function for templates to get activity icons"""
    icons = {
        'study': 'bi-book',
        'create': 'bi-plus-circle',
        'achievement': 'bi-trophy',
        'share': 'bi-share',
        'edit': 'bi-pencil'
    }
    return icons.get(activity_type, 'bi-circle')

# Make the function available to templates
@dashboard.app_template_global()
def get_activity_icon_global(activity_type):
    return get_activity_icon(activity_type)
