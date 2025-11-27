document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!checkAuth()) {
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Display username if element exists
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.username;
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
});

// 导航到指定工具
function navigateTo(tool) {
    switch(tool) {
        case 'roi':
            window.location.href = '/tools/roi/';
            break;
        case 'exercise':
            window.location.href = '/tools/exercise/';
            break;
        default:
            console.warn('Unknown tool:', tool);
    }
}