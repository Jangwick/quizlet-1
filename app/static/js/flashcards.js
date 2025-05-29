// Flashcard Set Creation and Management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize flashcard creation form
    initializeFlashcardForm();
    
    // Initialize study modes
    initializeStudyModes();
    
    // Initialize flashcard interactions
    initializeFlashcardInteractions();
});

// Flashcard Form Management
function initializeFlashcardForm() {
    const createSetForm = document.getElementById('create-set-form');
    const addCardBtn = document.getElementById('add-card-btn');
    const cardsContainer = document.getElementById('cards-container');
    
    if (addCardBtn && cardsContainer) {
        addCardBtn.addEventListener('click', addNewCard);
    }
    
    if (createSetForm) {
        createSetForm.addEventListener('submit', handleSetCreation);
    }
}

// Add new flashcard to the creation form
function addNewCard() {
    const cardsContainer = document.getElementById('cards-container');
    const cardCount = cardsContainer.children.length;
    
    const cardHtml = `
        <div class="card mb-3 flashcard-item" data-card-index="${cardCount}">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Card ${cardCount + 1}</h6>
                <button type="button" class="btn btn-sm btn-outline-danger remove-card-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label class="form-label">Term</label>
                        <textarea class="form-control" name="terms[]" rows="3" placeholder="Enter term" required></textarea>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Definition</label>
                        <textarea class="form-control" name="definitions[]" rows="3" placeholder="Enter definition" required></textarea>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    cardsContainer.insertAdjacentHTML('beforeend', cardHtml);
    
    // Add event listener to the new remove button
    const newCard = cardsContainer.lastElementChild;
    const removeBtn = newCard.querySelector('.remove-card-btn');
    removeBtn.addEventListener('click', function() {
        removeCard(newCard);
    });
    
    updateCardNumbers();
}

// Remove flashcard from creation form
function removeCard(cardElement) {
    const cardsContainer = document.getElementById('cards-container');
    if (cardsContainer.children.length > 1) {
        cardElement.remove();
        updateCardNumbers();
    } else {
        alert('You must have at least one card in your set.');
    }
}

// Update card numbers after adding/removing cards
function updateCardNumbers() {
    const cards = document.querySelectorAll('.flashcard-item');
    cards.forEach((card, index) => {
        const header = card.querySelector('.card-header h6');
        header.textContent = `Card ${index + 1}`;
        card.setAttribute('data-card-index', index);
    });
}

// Handle set creation form submission
function handleSetCreation(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const setData = {
        title: formData.get('title'),
        description: formData.get('description'),
        is_public: formData.get('is_public') === 'on',
        terms: formData.getAll('terms[]'),
        definitions: formData.getAll('definitions[]')
    };
    
    // Validate that we have at least one card
    if (setData.terms.length === 0 || setData.definitions.length === 0) {
        alert('Please add at least one flashcard to your set.');
        return;
    }
    
    // Validate that all cards have both term and definition
    for (let i = 0; i < setData.terms.length; i++) {
        if (!setData.terms[i].trim() || !setData.definitions[i].trim()) {
            alert(`Please fill in both term and definition for card ${i + 1}.`);
            return;
        }
    }
    
    // Submit the form (this will be handled by the backend when implemented)
    console.log('Set data:', setData);
    
    // Show success message (temporary until backend is implemented)
    showNotification('Flashcard set created successfully!', 'success');
    
    // Reset form
    event.target.reset();
    
    // Keep only one card
    const cardsContainer = document.getElementById('cards-container');
    const cards = cardsContainer.querySelectorAll('.flashcard-item');
    for (let i = 1; i < cards.length; i++) {
        cards[i].remove();
    }
    updateCardNumbers();
}

// Study Mode Functionality
function initializeStudyModes() {
    // Flashcard flip functionality
    const flashcards = document.querySelectorAll('.study-flashcard');
    flashcards.forEach(card => {
        card.addEventListener('click', flipCard);
    });
    
    // Navigation buttons
    const prevBtn = document.getElementById('prev-card');
    const nextBtn = document.getElementById('next-card');
    const shuffleBtn = document.getElementById('shuffle-cards');
    
    if (prevBtn) prevBtn.addEventListener('click', previousCard);
    if (nextBtn) nextBtn.addEventListener('click', nextCard);
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCards);
}

// Flip flashcard to show term/definition
function flipCard(event) {
    const card = event.currentTarget;
    card.classList.toggle('flipped');
    
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');
    
    if (card.classList.contains('flipped')) {
        front.style.display = 'none';
        back.style.display = 'block';
    } else {
        front.style.display = 'block';
        back.style.display = 'none';
    }
}

// Navigate to previous card
function previousCard() {
    const currentCard = document.querySelector('.study-flashcard.active');
    const prevCard = currentCard.previousElementSibling;
    
    if (prevCard) {
        currentCard.classList.remove('active');
        prevCard.classList.add('active');
        updateCardProgress();
    }
}

// Navigate to next card
function nextCard() {
    const currentCard = document.querySelector('.study-flashcard.active');
    const nextCard = currentCard.nextElementSibling;
    
    if (nextCard) {
        currentCard.classList.remove('active');
        nextCard.classList.add('active');
        updateCardProgress();
    }
}

// Shuffle cards
function shuffleCards() {
    const container = document.querySelector('.flashcards-container');
    const cards = Array.from(container.children);
    
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    // Re-append shuffled cards
    cards.forEach(card => container.appendChild(card));
    
    // Set first card as active
    cards.forEach(card => card.classList.remove('active'));
    cards[0].classList.add('active');
    
    updateCardProgress();
    showNotification('Cards shuffled!', 'info');
}

// Update progress indicator
function updateCardProgress() {
    const cards = document.querySelectorAll('.study-flashcard');
    const activeCard = document.querySelector('.study-flashcard.active');
    const currentIndex = Array.from(cards).indexOf(activeCard);
    
    const progressText = document.getElementById('card-progress');
    if (progressText) {
        progressText.textContent = `${currentIndex + 1} / ${cards.length}`;
    }
    
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const percentage = ((currentIndex + 1) / cards.length) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

// General flashcard interactions
function initializeFlashcardInteractions() {
    // Remove card buttons in creation mode
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-card-btn') || 
            event.target.closest('.remove-card-btn')) {
            const cardItem = event.target.closest('.flashcard-item');
            if (cardItem) {
                removeCard(cardItem);
            }
        }
    });
    
    // Auto-resize textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', autoResizeTextarea);
    });
}

// Auto-resize textarea based on content
function autoResizeTextarea(event) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Show notification messages
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Export functions for global access
window.flashcardUtils = {
    addNewCard,
    removeCard,
    flipCard,
    previousCard,
    nextCard,
    shuffleCards,
    showNotification
};
