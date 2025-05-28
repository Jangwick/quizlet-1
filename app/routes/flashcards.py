from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from flask_login import login_required, current_user
from app.models.flashcard import FlashcardSet, Flashcard, Tag
from app import db

flashcards = Blueprint('flashcards', __name__)

@flashcards.route('/')
@login_required
def index():
    sets = FlashcardSet.query.filter_by(creator_id=current_user.id).all()
    return render_template('flashcards/index.html', sets=sets)

@flashcards.route('/create', methods=['GET', 'POST'])
@login_required
def create_set():
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        is_public = 'is_public' in request.form
        
        flashcard_set = FlashcardSet(
            title=title,
            description=description,
            creator_id=current_user.id,
            is_public=is_public
        )
        
        db.session.add(flashcard_set)
        db.session.commit()
        
        flash('Flashcard set created successfully!', 'success')
        return redirect(url_for('flashcards.edit_set', set_id=flashcard_set.id))
    
    return render_template('flashcards/create_set.html')

@flashcards.route('/<int:set_id>')
def view_set(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    
    # Check if user can view this set
    if not flashcard_set.is_public and flashcard_set.creator_id != current_user.id:
        flash('You do not have permission to view this set.', 'error')
        return redirect(url_for('main.home'))
    
    return render_template('flashcards/view_set.html', flashcard_set=flashcard_set)

@flashcards.route('/<int:set_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_set(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    
    # Check if user owns this set
    if flashcard_set.creator_id != current_user.id:
        flash('You do not have permission to edit this set.', 'error')
        return redirect(url_for('flashcards.index'))
    
    if request.method == 'POST':
        flashcard_set.title = request.form.get('title')
        flashcard_set.description = request.form.get('description')
        flashcard_set.is_public = 'is_public' in request.form
        
        db.session.commit()
        flash('Set updated successfully!', 'success')
    
    return render_template('flashcards/edit_set.html', flashcard_set=flashcard_set)

@flashcards.route('/<int:set_id>/add_card', methods=['POST'])
@login_required
def add_card(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    
    if flashcard_set.creator_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    term = request.form.get('term')
    definition = request.form.get('definition')
    
    flashcard = Flashcard(
        term=term,
        definition=definition,
        set_id=set_id
    )
    
    db.session.add(flashcard)
    db.session.commit()
    
    return jsonify({'success': True, 'card_id': flashcard.id})
