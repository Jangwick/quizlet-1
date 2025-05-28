// Study mode functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeStudyMode();
    initializeMatchGame();
    initializeTestMode();
    initializeLearnMode();
});

// Study mode initialization
function initializeStudyMode() {
    const studyContainer = document.querySelector('.study-container');
    if (!studyContainer) return;
    
    const mode = studyContainer.dataset.mode;
    const setId = studyContainer.dataset.setId;
    
    if (!setId) return;
    
    // Load questions for the current mode
    loadStudyQuestions(setId, mode);
    
    // Initialize study controls
    initializeStudyControls();
    
    // Start study session tracking
    startStudySession(setId, mode);
}

// Load study questions
async function loadStudyQuestions(setId, mode) {
    try {
        const response = await fetch(`/study/api/${setId}/questions?mode=${mode}`);
        const questions = await response.json();
        
        window.studyData = {
            questions: questions,
            currentIndex: 0,
            correctAnswers: 0,
            startTime: Date.now(),
            mode: mode
        };
        
        displayCurrentQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        window.utils.showToast('Error loading study material', 'error');
    }
}

// Display current question
function displayCurrentQuestion() {
    const { questions, currentIndex } = window.studyData;
    const question = questions[currentIndex];
    
    if (!question) {
        showStudyComplete();
        return;
    }
    
    const questionContainer = document.getElementById('question-container');
    
    switch (question.type) {
        case 'flashcard':
            displayFlashcard(question);
            break;
        case 'multiple_choice':
            displayMultipleChoice(question);
            break;
        default:
            console.error('Unknown question type:', question.type);
    }
    
    updateStudyProgress();
}

// Display flashcard
function displayFlashcard(question) {
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="flashcard" data-card-id="${question.id}">
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <div class="flashcard-content">${question.term}</div>
                </div>
                <div class="flashcard-back">
                    <div class="flashcard-content">${question.definition}</div>
                </div>
            </div>
        </div>
        <div class="study-feedback mt-4 text-center" style="display: none;">
            <p>How well did you know this?</p>
            <div class="btn-group" role="group">
                <button class="btn btn-danger" onclick="answerFlashcard(false)">
                    <i class="bi bi-x-circle"></i> Don't Know
                </button>
                <button class="btn btn-warning" onclick="answerFlashcard('partial')">
                    <i class="bi bi-question-circle"></i> Partially
                </button>
                <button class="btn btn-success" onclick="answerFlashcard(true)">
                    <i class="bi bi-check-circle"></i> Know Well
                </button>
            </div>
        </div>
    `;
    
    // Initialize flashcard flip
    const flashcard = container.querySelector('.flashcard');
    flashcard.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
        if (flashcard.classList.contains('flipped')) {
            document.querySelector('.study-feedback').style.display = 'block';
        }
    });
}

// Display multiple choice question
function displayMultipleChoice(question) {
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="question-card">
            <h4 class="mb-4">${question.question}</h4>
            <div class="choices">
                ${question.choices.map((choice, index) => `
                    <button class="choice-btn btn btn-outline-primary w-100 mb-2 text-start" 
                            data-choice="${choice}" 
                            onclick="selectChoice(this, '${choice}', '${question.correct_answer}')">
                        ${String.fromCharCode(65 + index)}. ${choice}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Handle flashcard answer
function answerFlashcard(isCorrect) {
    const correct = isCorrect === true;
    
    if (correct || isCorrect === 'partial') {
        window.studyData.correctAnswers++;
    }
    
    submitAnswer(window.studyData.questions[window.studyData.currentIndex].id, correct);
    nextQuestion();
}

// Handle multiple choice selection
function selectChoice(button, selectedAnswer, correctAnswer) {
    const choices = document.querySelectorAll('.choice-btn');
    choices.forEach(btn => btn.disabled = true);
    
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-success');
        window.studyData.correctAnswers++;
    } else {
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-danger');
        
        // Show correct answer
        choices.forEach(btn => {
            if (btn.dataset.choice === correctAnswer) {
                btn.classList.remove('btn-outline-primary');
                btn.classList.add('btn-success');
            }
        });
    }
    
    submitAnswer(window.studyData.questions[window.studyData.currentIndex].id, isCorrect);
    
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

// Move to next question
function nextQuestion() {
    window.studyData.currentIndex++;
    displayCurrentQuestion();
}

// Submit answer to server
async function submitAnswer(flashcardId, isCorrect) {
    try {
        await fetch('/study/api/submit_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                flashcard_id: flashcardId,
                is_correct: isCorrect
            })
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
}

// Update study progress
function updateStudyProgress() {
    const { currentIndex, questions } = window.studyData;
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    const percentage = (currentIndex / questions.length) * 100;
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${currentIndex + 1} of ${questions.length}`;
    }
}

// Show study complete screen
function showStudyComplete() {
    const { correctAnswers, questions, startTime } = window.studyData;
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="study-complete text-center">
            <i class="bi bi-trophy-fill text-warning" style="font-size: 4rem;"></i>
            <h2 class="mt-3">Study Session Complete!</h2>
            <div class="stats mt-4">
                <div class="row">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-number">${accuracy}%</div>
                            <div class="stat-label">Accuracy</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-number">${correctAnswers}/${questions.length}</div>
                            <div class="stat-label">Correct</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-number">${window.utils.formatTime(duration)}</div>
                            <div class="stat-label">Time</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-4">
                <button class="btn btn-primary me-2" onclick="restartStudy()">
                    <i class="bi bi-arrow-clockwise"></i> Study Again
                </button>
                <a href="/dashboard" class="btn btn-outline-primary">
                    <i class="bi bi-house"></i> Dashboard
                </a>
            </div>
        </div>
    `;
}

// Initialize study controls
function initializeStudyControls() {
    const controls = document.querySelector('.study-controls');
    if (!controls) return;
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                const flashcard = document.querySelector('.flashcard');
                if (flashcard && !flashcard.classList.contains('flipped')) {
                    flashcard.click();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                // Go to previous question if implemented
                break;
        }
    });
}

// Initialize match game
function initializeMatchGame() {
    const matchGrid = document.querySelector('.match-grid');
    if (!matchGrid) return;
    
    const setId = matchGrid.dataset.setId;
    loadMatchGameData(setId);
}

// Load match game data
async function loadMatchGameData(setId) {
    try {
        const response = await fetch(`/study/api/${setId}/questions?mode=match`);
        const questions = await response.json();
        
        setupMatchGame(questions);
    } catch (error) {
        console.error('Error loading match game:', error);
    }
}

// Setup match game
function setupMatchGame(questions) {
    const grid = document.querySelector('.match-grid');
    const cards = [];
    
    // Create term and definition cards
    questions.forEach(q => {
        cards.push({ type: 'term', content: q.term, matchId: q.id });
        cards.push({ type: 'definition', content: q.definition, matchId: q.id });
    });
    
    // Shuffle cards
    const shuffledCards = window.utils.shuffleArray(cards);
    
    // Display cards
    grid.innerHTML = shuffledCards.map((card, index) => `
        <div class="match-card" data-match-id="${card.matchId}" data-type="${card.type}" data-index="${index}">
            ${card.content}
        </div>
    `).join('');
    
    // Initialize match game logic
    let selectedCards = [];
    let matchedCount = 0;
    const totalPairs = questions.length;
    
    document.querySelectorAll('.match-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('matched') || card.classList.contains('selected')) {
                return;
            }
            
            card.classList.add('selected');
            selectedCards.push(card);
            
            if (selectedCards.length === 2) {
                checkMatch(selectedCards, () => {
                    matchedCount++;
                    if (matchedCount === totalPairs) {
                        showMatchGameComplete();
                    }
                });
                selectedCards = [];
            }
        });
    });
}

// Check if two cards match
function checkMatch(cards, onMatch) {
    const [card1, card2] = cards;
    const match1 = card1.dataset.matchId;
    const match2 = card2.dataset.matchId;
    
    setTimeout(() => {
        if (match1 === match2 && card1.dataset.type !== card2.dataset.type) {
            // Match found
            cards.forEach(card => {
                card.classList.remove('selected');
                card.classList.add('matched');
            });
            onMatch();
        } else {
            // No match
            cards.forEach(card => {
                card.classList.remove('selected');
            });
        }
    }, 1000);
}

// Show match game complete
function showMatchGameComplete() {
    window.utils.showToast('Congratulations! All pairs matched!', 'success');
    
    setTimeout(() => {
        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn btn-primary';
        restartBtn.textContent = 'Play Again';
        restartBtn.onclick = () => location.reload();
        
        document.querySelector('.match-grid').appendChild(restartBtn);
    }, 2000);
}

// Initialize test mode
function initializeTestMode() {
    const testContainer = document.querySelector('.test-container');
    if (!testContainer) return;
    
    // Test mode is similar to multiple choice but with more formal structure
    // Implementation would be similar to multiple choice study mode
}

// Initialize learn mode (adaptive learning)
function initializeLearnMode() {
    const learnContainer = document.querySelector('.learn-container');
    if (!learnContainer) return;
    
    // Learn mode focuses on cards you don't know well
    // Implementation would prioritize cards based on user performance
}

// Start study session tracking
async function startStudySession(setId, mode) {
    try {
        await fetch('/study/api/start_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                set_id: setId,
                study_mode: mode
            })
        });
    } catch (error) {
        console.error('Error starting study session:', error);
    }
}

// Restart study session
function restartStudy() {
    window.studyData.currentIndex = 0;
    window.studyData.correctAnswers = 0;
    window.studyData.startTime = Date.now();
    
    // Shuffle questions for variety
    window.studyData.questions = window.utils.shuffleArray(window.studyData.questions);
    
    displayCurrentQuestion();
}

// Export functions
window.studyUtils = {
    answerFlashcard,
    selectChoice,
    nextQuestion,
    restartStudy
};
