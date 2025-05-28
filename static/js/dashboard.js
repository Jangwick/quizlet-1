// Dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadDashboardData();
    initializeCharts();
});

// Initialize dashboard
function initializeDashboard() {
    // Initialize quick actions
    initializeQuickActions();
    
    // Initialize recent activity
    initializeRecentActivity();
    
    // Initialize study streak display
    updateStudyStreak();
    
    // Initialize progress charts
    setTimeout(initializeCharts, 500);
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/dashboard/api/data');
        const data = await response.json();
        
        updateDashboardStats(data);
        updateRecentSets(data.recent_sets);
        updateActivityFeed(data.recent_activity);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    const stats = {
        'total-sets': data.total_sets || 0,
        'study-streak': data.study_streak || 0,
        'cards-studied': data.cards_studied_today || 0,
        'accuracy': data.overall_accuracy || 0
    };
    
    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateCounter(element, value);
        }
    });
}

// Animate counter numbers
function animateCounter(element, targetValue) {
    const startValue = 0;
    const duration = 1000;
    const increment = targetValue / (duration / 16);
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += increment;
        
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        if (element.id === 'accuracy') {
            element.textContent = Math.floor(currentValue) + '%';
        } else {
            element.textContent = Math.floor(currentValue);
        }
    }, 16);
}

// Update recent sets
function updateRecentSets(sets) {
    const container = document.getElementById('recent-sets');
    if (!container || !sets) return;
    
    container.innerHTML = sets.map(set => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card dashboard-card h-100">
                <div class="card-body">
                    <h6 class="card-title">${set.title}</h6>
                    <p class="card-text text-muted small">${set.card_count} cards</p>
                    <div class="progress mb-2" style="height: 5px;">
                        <div class="progress-bar" style="width: ${set.progress || 0}%"></div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${set.progress || 0}% mastered</small>
                        <div class="btn-group btn-group-sm">
                            <a href="/study/${set.id}/flashcards" class="btn btn-outline-primary">
                                <i class="bi bi-play"></i>
                            </a>
                            <a href="/flashcards/${set.id}" class="btn btn-outline-secondary">
                                <i class="bi bi-pencil"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update activity feed
function updateActivityFeed(activities) {
    const container = document.getElementById('activity-feed');
    if (!container || !activities) return;
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item d-flex align-items-start mb-3">
            <div class="activity-icon me-3">
                <i class="bi ${getActivityIcon(activity.type)} text-primary"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.description}</div>
                <small class="text-muted">${window.utils.formatDate(activity.timestamp)}</small>
            </div>
        </div>
    `).join('');
}

// Get activity icon based on type
function getActivityIcon(type) {
    const icons = {
        'study': 'bi-book',
        'create': 'bi-plus-circle',
        'achievement': 'bi-trophy',
        'streak': 'bi-fire'
    };
    
    return icons[type] || 'bi-circle';
}

// Initialize quick actions
function initializeQuickActions() {
    const quickActions = document.querySelectorAll('.quick-action');
    
    quickActions.forEach(action => {
        action.addEventListener('click', (e) => {
            const actionType = e.currentTarget.dataset.action;
            handleQuickAction(actionType);
        });
    });
}

// Handle quick actions
function handleQuickAction(actionType) {
    switch (actionType) {
        case 'create-set':
            window.location.href = '/flashcards/create';
            break;
        case 'continue-studying':
            continueStudying();
            break;
        case 'review-mistakes':
            reviewMistakes();
            break;
        case 'random-study':
            startRandomStudy();
            break;
    }
}

// Continue studying from where user left off
async function continueStudying() {
    try {
        const response = await fetch('/dashboard/api/continue-studying');
        const data = await response.json();
        
        if (data.set_id) {
            window.location.href = `/study/${data.set_id}/${data.mode}`;
        } else {
            window.utils.showToast('No recent study sessions found', 'info');
        }
    } catch (error) {
        console.error('Error continuing study:', error);
    }
}

// Review cards that were answered incorrectly
async function reviewMistakes() {
    try {
        const response = await fetch('/dashboard/api/review-mistakes');
        const data = await response.json();
        
        if (data.cards && data.cards.length > 0) {
            // Create a temporary review set
            sessionStorage.setItem('reviewCards', JSON.stringify(data.cards));
            window.location.href = '/study/review/mistakes';
        } else {
            window.utils.showToast('No mistakes to review!', 'success');
        }
    } catch (error) {
        console.error('Error loading mistakes:', error);
    }
}

// Start random study session
async function startRandomStudy() {
    try {
        const response = await fetch('/dashboard/api/random-set');
        const data = await response.json();
        
        if (data.set_id) {
            window.location.href = `/study/${data.set_id}/flashcards`;
        } else {
            window.utils.showToast('No study sets available', 'info');
        }
    } catch (error) {
        console.error('Error starting random study:', error);
    }
}

// Initialize recent activity
function initializeRecentActivity() {
    const activityItems = document.querySelectorAll('.activity-item');
    
    // Add staggered animation
    activityItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, index * 100);
    });
}

// Update study streak display
function updateStudyStreak() {
    const streakElement = document.getElementById('study-streak');
    if (!streakElement) return;
    
    const streak = parseInt(streakElement.textContent) || 0;
    
    // Add fire emoji for streaks
    if (streak > 0) {
        const fireIcon = document.createElement('i');
        fireIcon.className = 'bi bi-fire text-warning ms-1';
        streakElement.appendChild(fireIcon);
    }
    
    // Encourage user to maintain streak
    if (streak >= 7) {
        window.utils.showToast(`Amazing! ${streak} day study streak! 🔥`, 'success');
    }
}

// Initialize charts
function initializeCharts() {
    initializeProgressChart();
    initializeAccuracyChart();
    initializeStudyTimeChart();
}

// Initialize progress chart
async function initializeProgressChart() {
    const canvas = document.getElementById('progress-chart');
    if (!canvas) return;
    
    try {
        const response = await fetch('/dashboard/api/progress-data');
        const data = await response.json();
        
        // Simple canvas-based chart (you could use Chart.js here instead)
        drawProgressChart(canvas, data);
    } catch (error) {
        console.error('Error loading progress data:', error);
    }
}

// Draw progress chart (simple implementation)
function drawProgressChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (!data || data.length === 0) {
        ctx.fillStyle = '#6c757d';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
    }
    
    // Draw simple line chart
    ctx.strokeStyle = '#0d6efd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxValue = Math.max(...data.map(d => d.value));
    const stepX = width / (data.length - 1);
    const stepY = height / maxValue;
    
    data.forEach((point, index) => {
        const x = index * stepX;
        const y = height - (point.value * stepY);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#0d6efd';
    data.forEach((point, index) => {
        const x = index * stepX;
        const y = height - (point.value * stepY);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Initialize accuracy chart
function initializeAccuracyChart() {
    const canvas = document.getElementById('accuracy-chart');
    if (!canvas) return;
    
    // Implementation similar to progress chart
    // This would show accuracy trends over time
}

// Initialize study time chart
function initializeStudyTimeChart() {
    const canvas = document.getElementById('study-time-chart');
    if (!canvas) return;
    
    // Implementation similar to progress chart
    // This would show daily study time
}

// Export dashboard utilities
window.dashboardUtils = {
    updateDashboardStats,
    updateRecentSets,
    handleQuickAction
};
