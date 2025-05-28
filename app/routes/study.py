from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from app.models.flashcard import FlashcardSet, Flashcard
from app.models.progress import StudySession, UserProgress
from app import db
import random

study = Blueprint('study', __name__)

@study.route('/<int:set_id>/flashcards')
@login_required
def flashcards_mode(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    return render_template('study/flashcards.html', flashcard_set=flashcard_set)

@study.route('/<int:set_id>/learn')
@login_required
def learn_mode(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    return render_template('study/learn.html', flashcard_set=flashcard_set)

@study.route('/<int:set_id>/test')
@login_required
def test_mode(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    return render_template('study/test.html', flashcard_set=flashcard_set)

@study.route('/<int:set_id>/match')
@login_required
def match_mode(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    return render_template('study/match.html', flashcard_set=flashcard_set)

@study.route('/api/<int:set_id>/questions')
@login_required
def get_questions(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    mode = request.args.get('mode', 'flashcards')
    
    questions = []
    
    for card in flashcard_set.flashcards:
        if mode == 'multiple_choice':
            # Generate multiple choice question
            wrong_answers = [c.definition for c in flashcard_set.flashcards if c.id != card.id]
            choices = random.sample(wrong_answers, min(3, len(wrong_answers))) + [card.definition]
            random.shuffle(choices)
            
            questions.append({
                'id': card.id,
                'question': card.term,
                'choices': choices,
                'correct_answer': card.definition,
                'type': 'multiple_choice'
            })
        else:
            # Regular flashcard format
            questions.append({
                'id': card.id,
                'term': card.term,
                'definition': card.definition,
                'type': 'flashcard'
            })
    
    random.shuffle(questions)
    return jsonify(questions)

@study.route('/api/submit_answer', methods=['POST'])
@login_required
def submit_answer():
    data = request.get_json()
    flashcard_id = data.get('flashcard_id')
    is_correct = data.get('is_correct', False)
    
    # Update user progress
    progress = UserProgress.query.filter_by(
        user_id=current_user.id,
        flashcard_id=flashcard_id
    ).first()
    
    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            flashcard_id=flashcard_id
        )
        db.session.add(progress)
    
    if is_correct:
        progress.correct_count += 1
        progress.confidence_level = min(5, progress.confidence_level + 1)
    else:
        progress.incorrect_count += 1
        progress.confidence_level = max(1, progress.confidence_level - 1)
    
    db.session.commit()
    
    return jsonify({'success': True})
