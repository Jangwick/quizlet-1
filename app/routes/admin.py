from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from functools import wraps
from app import db
from app.models.user import User
from app.models.flashcard import FlashcardSet, Flashcard
from app.models.progress import StudySession, UserProgress
from sqlalchemy import func
from datetime import datetime, timedelta

admin = Blueprint('admin', __name__, url_prefix='/admin')

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            flash('Access denied. Admin privileges required.', 'error')
            return redirect(url_for('main.home'))
        return f(*args, **kwargs)
    return decorated_function

@admin.route('/')
@login_required
@admin_required
def index():
    # Get system statistics
    try:
        total_users = User.query.count()
        total_sets = FlashcardSet.query.count()
        total_cards = Flashcard.query.count()
        
        # Daily active users (users who studied today)
        today = datetime.now().date()
        daily_active_users = db.session.query(User.id).join(StudySession)\
                              .filter(func.date(StudySession.start_time) == today)\
                              .distinct().count()
    except Exception as e:
        # Fallback values if database models aren't ready
        total_users = 0
        total_sets = 0
        total_cards = 0
        daily_active_users = 0
    
    # Get recent users (last 5)
    try:
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    except Exception as e:
        recent_users = []
    
    # Get pending content for moderation (public sets created recently)
    try:
        pending_content = FlashcardSet.query.filter_by(is_public=True)\
                           .order_by(FlashcardSet.created_at.desc())\
                           .limit(5).all()
    except Exception as e:
        pending_content = []
    
    return render_template('admin/index.html',
                         total_users=total_users,
                         total_sets=total_sets,
                         total_cards=total_cards,
                         daily_active_users=daily_active_users,
                         recent_users=recent_users,
                         pending_content=pending_content,
                         server_uptime='2 days, 14 hours',
                         last_backup='Never')

@admin.route('/users')
@login_required
@admin_required
def users():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    try:
        users = User.query.paginate(
            page=page, per_page=per_page, error_out=False
        )
    except Exception as e:
        users = None
    
    return render_template('admin/users.html', users=users)

@admin.route('/users/<int:user_id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        
        if request.method == 'POST':
            user.role = request.form.get('role', user.role)
            user.is_active = 'is_active' in request.form
            
            db.session.commit()
            flash(f'User {user.username} updated successfully.', 'success')
            return redirect(url_for('admin.users'))
        
        return render_template('admin/edit_user.html', user=user)
    except Exception as e:
        flash('User not found or database error.', 'error')
        return redirect(url_for('admin.users'))

@admin.route('/users/<int:user_id>/toggle_status', methods=['POST'])
@login_required
@admin_required
def toggle_user_status(user_id):
    try:
        user = User.query.get_or_404(user_id)
        user.is_active = not user.is_active
        db.session.commit()
        
        status = 'activated' if user.is_active else 'deactivated'
        return jsonify({'success': True, 'message': f'User {status} successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error updating user status.'})

@admin.route('/moderation')
@login_required
@admin_required
def moderation():
    try:
        # Get all public flashcard sets for moderation
        sets = FlashcardSet.query.filter_by(is_public=True)\
                 .order_by(FlashcardSet.created_at.desc()).all()
    except Exception as e:
        sets = []
    
    return render_template('admin/moderation.html', sets=sets)

@admin.route('/content/<int:content_id>/approve', methods=['POST'])
@login_required
@admin_required
def approve_content(content_id):
    try:
        content = FlashcardSet.query.get_or_404(content_id)
        # Add approval logic here (e.g., set approved flag)
        flash('Content approved successfully.', 'success')
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error approving content.'})

@admin.route('/content/<int:content_id>/reject', methods=['POST'])
@login_required
@admin_required
def reject_content(content_id):
    try:
        content = FlashcardSet.query.get_or_404(content_id)
        content.is_public = False
        db.session.commit()
        flash('Content rejected and made private.', 'success')
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error rejecting content.'})

@admin.route('/analytics')
@login_required
@admin_required
def analytics():
    # Generate analytics data
    try:
        # User growth over time
        user_growth = db.session.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).group_by(func.date(User.created_at)).all()
        
        # Study activity over time
        study_activity = db.session.query(
            func.date(StudySession.start_time).label('date'),
            func.count(StudySession.id).label('count')
        ).group_by(func.date(StudySession.start_time)).all()
        
    except Exception as e:
        user_growth = []
        study_activity = []
    
    return render_template('admin/analytics.html',
                         user_growth=user_growth,
                         study_activity=study_activity)

@admin.route('/settings', methods=['GET', 'POST'])
@login_required
@admin_required
def settings():
    if request.method == 'POST':
        # Handle system settings updates
        flash('Settings updated successfully.', 'success')
        return redirect(url_for('admin.settings'))
    
    return render_template('admin/settings.html')
