// Flashcard-specific functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeFlashcardEditor();
    initializeFlashcardViewer();
});

// Flashcard editor initialization
function initializeFlashcardEditor() {
    const addCardBtn = document.getElementById('add-card-btn');
    const flashcardForm = document.getElementById('flashcard-form');
    
    if (addCardBtn) {
        addCardBtn.addEventListener('click', addNewCard);
    }
    
    if (flashcardForm) {
        flashcardForm.addEventListener('submit', saveFlashcardSet);
    }
    
    // Initialize existing card delete buttons
    document.querySelectorAll('.delete-card-btn').forEach(btn => {
        btn.addEventListener('click', deleteCard);
    });
    
    // Auto-save functionality
    let saveTimeout;
    document.querySelectorAll('.card-input').forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(autoSave, 2000);
        });
    });
}

// Add new flashcard
function addNewCard() {
    const cardContainer = document.getElementById('cards-container');
    const cardCount = cardContainer.children.length;
    
    const cardHtml = `
        <div class="term-definition-pair position-relative" data-card-id="new">
            <button type="button" class="delete-card-btn" onclick="deleteCard(event)">
                <i class="bi bi-x"></i>
            </button>
            <div class="row">
                <div class="col-md-6">
                    <label class="form-label">Term</label>
                    <textarea class="form-control card-input" name="terms[]" rows="3" placeholder="Enter term"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Definition</label>
                    <textarea class="form-control card-input" name="definitions[]" rows="3" placeholder="Enter definition"></textarea>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-md-6">
                    <label class="form-label">Image URL (optional)</label>
                    <input type="url" class="form-control" name="image_urls[]" placeholder="https://...">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Audio URL (optional)</label>
                    <input type="url" class="form-control" name="audio_urls[]" placeholder="https://...">
                </div>
            </div>
        </div>
    `;
    
    cardContainer.insertAdjacentHTML('beforeend', cardHtml);
    
    // Focus on the new term input
    const newCard = cardContainer.lastElementChild;
    newCard.querySelector('textarea[name="terms[]"]').focus();
    
    // Add slide-up animation
    newCard.classList.add('slide-up');
}

// Delete flashcard
function deleteCard(event) {
    const card = event.target.closest('.term-definition-pair');
    const cardId = card.dataset.cardId;
    
    if (confirm('Are you sure you want to delete this card?')) {
        if (cardId !== 'new') {
            // Mark for deletion if it's an existing card
            const deleteInput = document.createElement('input');
            deleteInput.type = 'hidden';
            deleteInput.name = 'deleted_cards[]';
            deleteInput.value = cardId;
            card.appendChild(deleteInput);
            card.style.display = 'none';
        } else {
            // Remove from DOM if it's a new card
            card.remove();
        }
        
        window.utils.showToast('Card deleted', 'info');
    }
}

// Save flashcard set
async function saveFlashcardSet(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(event.target);
        const response = await fetch(event.target.action, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            window.utils.showToast('Flashcard set saved successfully!', 'success');
            
            // Redirect if it's a new set
            if (window.location.pathname.includes('/create')) {
                const result = await response.json();
                window.location.href = `/flashcards/${result.set_id}/edit`;
            }
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        window.utils.showToast('Error saving flashcard set', 'error');
        console.error('Save error:', error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Auto-save functionality
async function autoSave() {
    const form = document.getElementById('flashcard-form');
    if (!form) return;
    
    try {
        const formData = new FormData(form);
        formData.append('auto_save', 'true');
        
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showAutoSaveIndicator();
        }
    } catch (error) {
        console.error('Auto-save error:', error);
    }
}

// Show auto-save indicator
function showAutoSaveIndicator() {
    let indicator = document.getElementById('auto-save-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'auto-save-indicator';
        indicator.className = 'position-fixed bottom-0 start-0 m-3 badge bg-success';
        indicator.style.zIndex = '1050';
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = 'Auto-saved';
    indicator.style.display = 'block';
    
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 2000);
}

// Flashcard viewer initialization
function initializeFlashcardViewer() {
    const flashcards = document.querySelectorAll('.flashcard');
    
    flashcards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
            
            // Track card flip for analytics
            const cardId = card.dataset.cardId;
            if (cardId) {
                trackCardInteraction(cardId, 'flip');
            }
        });
        
        // Keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('flipped');
            }
        });
        
        // Make focusable for accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Click to flip flashcard');
    });
    
    // Keyboard shortcuts for navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.closest('.flashcard-container')) {
            handleFlashcardNavigation(e);
        }
    });
}

// Handle flashcard navigation
function handleFlashcardNavigation(event) {
    const currentCard = document.querySelector('.flashcard.active') || document.querySelector('.flashcard');
    if (!currentCard) return;
    
    const allCards = Array.from(document.querySelectorAll('.flashcard'));
    const currentIndex = allCards.indexOf(currentCard);
    
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            event.preventDefault();
            if (currentIndex > 0) {
                showCard(currentIndex - 1);
            }
            break;
            
        case 'ArrowRight':
        case 'ArrowDown':
            event.preventDefault();
            if (currentIndex < allCards.length - 1) {
                showCard(currentIndex + 1);
            }
            break;
            
        case ' ':
            event.preventDefault();
            currentCard.classList.toggle('flipped');
            break;
    }
}

// Show specific card
function showCard(index) {
    const allCards = document.querySelectorAll('.flashcard');
    
    allCards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
        card.style.display = i === index ? 'block' : 'none';
    });
    
    // Update progress indicator
    updateProgressIndicator(index + 1, allCards.length);
}

// Update progress indicator
function updateProgressIndicator(current, total) {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar) {
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
    }
    
    if (progressText) {
        progressText.textContent = `${current} of ${total}`;
    }
}

// Track card interaction for analytics
async function trackCardInteraction(cardId, action) {
    try {
        await fetch('/api/track-interaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                card_id: cardId,
                action: action,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Tracking error:', error);
    }
}

// Export functions for use in other modules
window.flashcardUtils = {
    addNewCard,
    deleteCard,
    showCard,
    trackCardInteraction
};
