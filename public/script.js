document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!checkAuth()) {
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Display username
    document.getElementById('username-display').textContent = currentUser.username;
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
});

// 导航到指定工具
function navigateToTool(toolName) {
    if (!checkAuth()) {
        return;
    }
    
    switch(toolName) {
        case 'roi':
            window.location.href = '/tools/roi/index.html';
            break;
        case 'exercise':
            window.location.href = '/tools/exercise/index.html';
            break;
        default:
            alert('工具尚未实现');
    }
}