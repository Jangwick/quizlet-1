class StudyModeBase {
    constructor(container, setId) {
        this.container = container;
        this.setId = setId;
        this.flashcards = [];
        this.currentIndex = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
    }

    async loadFlashcards() {
        try {
            // Extract flashcards from the DOM
            this.extractFlashcardsFromDOM();
            if (this.flashcards.length === 0) {
                throw new Error('No flashcards found');
            }
            return this.flashcards;
        } catch (error) {
            console.error('Error loading flashcards:', error);
            this.showError('No flashcards available for study.');
            return [];
        }
    }

    extractFlashcardsFromDOM() {
        const flashcardItems = document.querySelectorAll('#flashcard-data .flashcard-item');
        this.flashcards = Array.from(flashcardItems).map(item => ({
            id: item.dataset.id,
            term: item.dataset.term,
            definition: item.dataset.definition
        }));
    }

    showError(message) {
        const container = document.getElementById('question-container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error</h4>
                    <p>${message}</p>
                    <button class="btn btn-outline-danger" onclick="location.reload()">Try Again</button>
                </div>
            `;
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

class LearnMode extends StudyModeBase {
    constructor(container, setId) {
        super(container, setId);
        this.masteredCards = new Set();
        this.incorrectCards = [];
        this.currentQuestion = null;
        this.isDefinitionToTerm = Math.random() < 0.5;
    }

    async init() {
        await this.loadFlashcards();
        if (this.flashcards.length === 0) return;
        
        this.setupUI();
        this.showNextQuestion();
    }

    setupUI() {
        // Add progress bar and score display if not present
        const container = this.container.parentElement;
        if (!document.getElementById('learn-progress')) {
            const progressHTML = `
                <div class="progress mb-4">
                    <div class="progress-bar" role="progressbar" style="width: 0%" id="learn-progress"></div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="card text-center">
                            <div class="card-body py-2">
                                <span class="text-success fw-bold">Correct: <span id="correct-count">0</span></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card text-center">
                            <div class="card-body py-2">
                                <span class="text-danger fw-bold">Incorrect: <span id="incorrect-count">0</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('afterbegin', progressHTML);
        }
        this.updateProgress();
    }

    showNextQuestion() {
        if (this.masteredCards.size === this.flashcards.length) {
            this.showCompletion();
            return;
        }

        let availableCards = this.incorrectCards.length > 0 
            ? this.incorrectCards 
            : this.flashcards.filter(card => !this.masteredCards.has(card.id));

        if (availableCards.length === 0) {
            this.showCompletion();
            return;
        }

        this.currentQuestion = availableCards[Math.floor(Math.random() * availableCards.length)];
        this.isDefinitionToTerm = Math.random() < 0.5;

        const questionText = this.isDefinitionToTerm ? this.currentQuestion.definition : this.currentQuestion.term;
        const answerText = this.isDefinitionToTerm ? this.currentQuestion.term : this.currentQuestion.definition;

        document.getElementById('question-container').innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body p-4">
                    <h5 class="card-title mb-3">What is the ${this.isDefinitionToTerm ? 'term' : 'definition'} for:</h5>
                    <div class="question-text mb-4 p-3 bg-light rounded">
                        <h4>${questionText}</h4>
                    </div>
                    <div class="answer-input">
                        <input type="text" class="form-control form-control-lg mb-3" 
                               id="user-answer" placeholder="Type your answer here..." autocomplete="off">
                        <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                            <button class="btn btn-primary btn-lg" id="submit-answer">Submit</button>
                            <button class="btn btn-outline-secondary btn-lg" id="dont-know">I don't know</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('submit-answer').addEventListener('click', () => this.checkAnswer());
        document.getElementById('dont-know').addEventListener('click', () => this.showAnswer(false));
        document.getElementById('user-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        
        document.getElementById('user-answer').focus();
    }

    checkAnswer() {
        const userAnswer = document.getElementById('user-answer').value.trim().toLowerCase();
        const correctAnswer = (this.isDefinitionToTerm ? this.currentQuestion.term : this.currentQuestion.definition).toLowerCase();
        
        const isCorrect = this.isAnswerCorrect(userAnswer, correctAnswer);
        this.showAnswer(isCorrect);
    }

    isAnswerCorrect(userAnswer, correctAnswer) {
        if (userAnswer === correctAnswer) return true;
        
        // Simple similarity check
        const similarity = this.calculateSimilarity(userAnswer, correctAnswer);
        return similarity >= 0.7;
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }

    showAnswer(isCorrect) {
        const correctAnswer = this.isDefinitionToTerm ? this.currentQuestion.term : this.currentQuestion.definition;
        const userAnswer = document.getElementById('user-answer').value.trim();

        if (isCorrect) {
            this.correctCount++;
            this.masteredCards.add(this.currentQuestion.id);
            this.incorrectCards = this.incorrectCards.filter(card => card.id !== this.currentQuestion.id);
        } else {
            this.incorrectCount++;
            if (!this.incorrectCards.find(card => card.id === this.currentQuestion.id)) {
                this.incorrectCards.push(this.currentQuestion);
            }
        }

        document.getElementById('question-container').innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body p-4 text-center">
                    <div class="${isCorrect ? 'text-success' : 'text-danger'} mb-3">
                        <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'} fa-3x"></i>
                        <h3 class="mt-2">${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    </div>
                    ${!isCorrect ? `
                        <div class="mb-3">
                            <p><strong>Your answer:</strong> ${userAnswer || 'No answer provided'}</p>
                        </div>
                    ` : ''}
                    <div class="mb-4">
                        <p><strong>Correct answer:</strong></p>
                        <h4 class="text-primary">${correctAnswer}</h4>
                    </div>
                    <button class="btn btn-primary btn-lg" id="continue-btn">Continue</button>
                </div>
            </div>
        `;

        document.getElementById('continue-btn').addEventListener('click', () => {
            this.updateProgress();
            this.showNextQuestion();
        });

        this.updateCounters();
    }

    updateProgress() {
        const progressBar = document.getElementById('learn-progress');
        if (progressBar) {
            const progress = (this.masteredCards.size / this.flashcards.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    updateCounters() {
        const correctEl = document.getElementById('correct-count');
        const incorrectEl = document.getElementById('incorrect-count');
        if (correctEl) correctEl.textContent = this.correctCount;
        if (incorrectEl) incorrectEl.textContent = this.incorrectCount;
    }

    showCompletion() {
        document.getElementById('question-container').innerHTML = `
            <div class="card shadow-sm text-center">
                <div class="card-body p-5">
                    <div class="text-success mb-4">
                        <i class="fas fa-trophy fa-4x"></i>
                    </div>
                    <h2 class="text-success mb-3">Congratulations!</h2>
                    <p class="lead">You've mastered all the terms in this set!</p>
                    <div class="row mt-4">
                        <div class="col-6">
                            <div class="text-success">
                                <h4>${this.correctCount}</h4>
                                <small>Correct</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-danger">
                                <h4>${this.incorrectCount}</h4>
                                <small>Incorrect</small>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <button class="btn btn-primary me-2" onclick="location.reload()">Study Again</button>
                        <button class="btn btn-outline-secondary" onclick="history.back()">Back to Set</button>
                    </div>
                </div>
            </div>
        `;
    }
}

class MatchMode extends StudyModeBase {
    constructor(container, setId) {
        super(container, setId);
        this.selectedCards = [];
        this.matchedPairs = new Set();
        this.startTime = null;
        this.timer = null;
        this.gameCards = [];
    }

    async init() {
        await this.loadFlashcards();
        if (this.flashcards.length === 0) return;
        
        this.setupUI();
        this.setupGame();
        this.startTimer();
    }

    setupUI() {
        const container = this.container.parentElement;
        if (!document.getElementById('timer')) {
            const statsHTML = `
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body py-2">
                                <span class="fw-bold">Time: <span id="timer">0:00</span></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body py-2">
                                <span class="fw-bold">Matches: <span id="matches-count">0</span>/<span id="total-matches">0</span></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body py-2">
                                <button class="btn btn-sm btn-outline-primary" id="restart-match">Restart</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('afterbegin', statsHTML);
            
            document.getElementById('restart-match').addEventListener('click', () => {
                this.restart();
            });
        }
    }

    setupGame() {
        this.gameCards = [];
        this.flashcards.forEach(card => {
            this.gameCards.push({
                id: `term-${card.id}`,
                content: card.term,
                type: 'term',
                pairId: card.id
            });
            this.gameCards.push({
                id: `def-${card.id}`,
                content: card.definition,
                type: 'definition',
                pairId: card.id
            });
        });

        this.gameCards = this.shuffleArray(this.gameCards);
        this.renderGrid();
        
        document.getElementById('total-matches').textContent = this.flashcards.length;
        document.getElementById('matches-count').textContent = '0';
    }

    renderGrid() {
        const container = this.container.querySelector('.match-grid') || this.container;
        container.innerHTML = '';
        container.className = 'match-grid row g-2';

        this.gameCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'col-md-3 col-sm-4 col-6';
            cardElement.innerHTML = `
                <div class="match-card card h-100 ${card.type}" data-id="${card.id}" data-pair-id="${card.pairId}">
                    <div class="card-body d-flex align-items-center justify-content-center text-center p-2">
                        <span class="card-text">${card.content}</span>
                    </div>
                </div>
            `;
            
            cardElement.addEventListener('click', () => this.selectCard(card, cardElement));
            container.appendChild(cardElement);
        });
    }

    selectCard(card, element) {
        const cardEl = element.querySelector('.match-card');
        
        if (cardEl.classList.contains('matched') || cardEl.classList.contains('selected')) {
            return;
        }

        if (this.selectedCards.length === 2) {
            this.selectedCards.forEach(selected => {
                selected.element.classList.remove('selected');
            });
            this.selectedCards = [];
        }

        cardEl.classList.add('selected');
        this.selectedCards.push({ card, element: cardEl });

        if (this.selectedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 500);
        }
    }

    checkMatch() {
        const [first, second] = this.selectedCards;
        
        if (first.card.pairId === second.card.pairId && first.card.type !== second.card.type) {
            first.element.classList.remove('selected');
            second.element.classList.remove('selected');
            first.element.classList.add('matched');
            second.element.classList.add('matched');
            
            this.matchedPairs.add(first.card.pairId);
            document.getElementById('matches-count').textContent = this.matchedPairs.size;
            
            if (this.matchedPairs.size === this.flashcards.length) {
                this.gameComplete();
            }
        } else {
            first.element.classList.remove('selected');
            second.element.classList.remove('selected');
            first.element.classList.add('no-match');
            second.element.classList.add('no-match');
            
            setTimeout(() => {
                first.element.classList.remove('no-match');
                second.element.classList.remove('no-match');
            }, 1000);
        }
        
        this.selectedCards = [];
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    gameComplete() {
        clearInterval(this.timer);
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.container.innerHTML = `
            <div class="card shadow-sm text-center">
                <div class="card-body p-5">
                    <div class="text-success mb-4">
                        <i class="fas fa-trophy fa-4x"></i>
                    </div>
                    <h2 class="text-success mb-3">Perfect Match!</h2>
                    <p class="lead">You completed the game in <strong>${timeStr}</strong></p>
                    <div class="mt-3">
                        <span class="badge bg-success fs-6">All ${this.matchedPairs.size} matches found!</span>
                    </div>
                    <div class="mt-4">
                        <button class="btn btn-primary me-2" onclick="location.reload()">Play Again</button>
                        <button class="btn btn-outline-secondary" onclick="history.back()">Back to Set</button>
                    </div>
                </div>
            </div>
        `;
    }

    restart() {
        clearInterval(this.timer);
        this.selectedCards = [];
        this.matchedPairs.clear();
        this.setupGame();
        this.startTimer();
    }
}

class TestMode extends StudyModeBase {
    constructor(container, setId) {
        super(container, setId);
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.isComplete = false;
    }

    async init() {
        await this.loadFlashcards();
        if (this.flashcards.length === 0) return;
        
        this.setupUI();
        this.generateQuestions();
        this.showCurrentQuestion();
    }

    setupUI() {
        const container = this.container.parentElement;
        if (!document.getElementById('test-progress')) {
            const progressHTML = `
                <div class="progress mb-4">
                    <div class="progress-bar" role="progressbar" style="width: 0%" id="test-progress"></div>
                </div>
                <div class="row mb-3">
                    <div class="col-12">
                        <div class="card text-center">
                            <div class="card-body py-2">
                                <span class="fw-bold">Question <span id="current-question">1</span> of <span id="total-questions">0</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('afterbegin', progressHTML);
        }
    }

    generateQuestions() {
        this.questions = this.flashcards.map(card => {
            const isDefinitionQuestion = Math.random() < 0.5;
            const question = isDefinitionQuestion ? card.definition : card.term;
            const correctAnswer = isDefinitionQuestion ? card.term : card.definition;
            
            const wrongAnswers = this.flashcards
                .filter(c => c.id !== card.id)
                .map(c => isDefinitionQuestion ? c.term : c.definition)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
            
            const options = this.shuffleArray([correctAnswer, ...wrongAnswers]);
            
            return {
                id: card.id,
                question,
                options,
                correctAnswer,
                isDefinitionQuestion
            };
        });
        
        this.questions = this.shuffleArray(this.questions);
        document.getElementById('total-questions').textContent = this.questions.length;
    }

    showCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        document.getElementById('question-container').innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body p-4">
                    <h5 class="card-title mb-3">Select the correct ${question.isDefinitionQuestion ? 'term' : 'definition'}:</h5>
                    <div class="question-text mb-4 p-3 bg-light rounded">
                        <h4>${question.question}</h4>
                    </div>
                    <div class="options">
                        ${question.options.map((option, index) => `
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" name="answer" id="option${index}" value="${option}">
                                <label class="form-check-label p-2 w-100" for="option${index}">
                                    ${option}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    <div class="text-center mt-4">
                        <button class="btn btn-primary btn-lg" id="submit-test-answer" disabled>Submit Answer</button>
                    </div>
                </div>
            </div>
        `;

        document.querySelectorAll('input[name="answer"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('submit-test-answer').disabled = false;
            });
        });

        document.getElementById('submit-test-answer').addEventListener('click', () => {
            this.submitAnswer();
        });

        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        this.updateProgress();
    }

    submitAnswer() {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (!selectedOption) return;

        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedOption.value === question.correctAnswer;
        
        this.answers.push({
            question: question.question,
            selectedAnswer: selectedOption.value,
            correctAnswer: question.correctAnswer,
            isCorrect
        });

        if (isCorrect) {
            this.correctCount++;
        } else {
            this.incorrectCount++;
        }

        this.currentQuestionIndex++;
        
        setTimeout(() => {
            this.showCurrentQuestion();
        }, 300);
    }

    updateProgress() {
        const progressBar = document.getElementById('test-progress');
        if (progressBar) {
            const progress = (this.currentQuestionIndex / this.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    showResults() {
        const percentage = Math.round((this.correctCount / this.questions.length) * 100);
        
        document.getElementById('question-container').innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body p-5 text-center">
                    <div class="display-4 mb-3">
                        <span class="text-primary">${percentage}%</span>
                    </div>
                    <h3 class="mb-4">Test Complete!</h3>
                    <div class="row mb-4">
                        <div class="col-4">
                            <div class="text-success">
                                <h4>${this.correctCount}</h4>
                                <small>Correct</small>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="text-danger">
                                <h4>${this.incorrectCount}</h4>
                                <small>Incorrect</small>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="text-primary">
                                <h4>${this.questions.length}</h4>
                                <small>Total</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-start mt-4">
                        <h6 class="mb-3">Question Review:</h6>
                        <div style="max-height: 300px; overflow-y: auto;">
                            ${this.answers.map((answer, index) => `
                                <div class="card mb-2 ${answer.isCorrect ? 'border-success' : 'border-danger'}">
                                    <div class="card-body p-3">
                                        <div class="d-flex align-items-center mb-2">
                                            <span class="badge ${answer.isCorrect ? 'bg-success' : 'bg-danger'} me-2">
                                                ${index + 1}
                                            </span>
                                            <small class="text-muted">${answer.question}</small>
                                        </div>
                                        <div class="small">
                                            <div class="${answer.isCorrect ? 'text-success' : 'text-danger'}">
                                                Your answer: ${answer.selectedAnswer}
                                            </div>
                                            ${!answer.isCorrect ? `
                                                <div class="text-success">
                                                    Correct answer: ${answer.correctAnswer}
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button class="btn btn-primary me-2" onclick="location.reload()">Retake Test</button>
                        <button class="btn btn-outline-secondary" onclick="history.back()">Back to Set</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the appropriate mode when page loads
document.addEventListener('DOMContentLoaded', function() {
    const learnContainer = document.querySelector('[data-mode="learn"]');
    const matchContainer = document.querySelector('.match-grid');
    const testContainer = document.querySelector('[data-mode="test"]');

    if (learnContainer) {
        const setId = learnContainer.dataset.setId;
        const learnMode = new LearnMode(learnContainer, setId);
        learnMode.init();
    }

    if (matchContainer) {
        const setId = matchContainer.dataset.setId;
        const matchMode = new MatchMode(matchContainer.parentElement, setId);
        matchMode.init();
    }

    if (testContainer) {
        const setId = testContainer.dataset.setId;
        const testMode = new TestMode(testContainer, setId);
        testMode.init();
    }
});
