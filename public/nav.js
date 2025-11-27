document.addEventListener('DOMContentLoaded', function() {
    // Load navigation bar
    fetch('/nav.html')
        .then(response => response.text())
        .then(html => {
            // Insert navigation bar at the beginning of the container
            const container = document.querySelector('.container');
            if (container) {
                container.insertAdjacentHTML('afterbegin', html);
                initializeNav();
            }
        })
        .catch(error => {
            console.error('Error loading navigation:', error);
        });
});

function initializeNav() {
    // Set active nav link based on current page
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = new URL(link.href).pathname;
        
        // Special handling for home page
        if ((currentPage === '/' || currentPage === '/index.html') && 
            (linkPage === '/' || linkPage === '/index.html')) {
            link.classList.add('active');
        } 
        // For other pages, check if the link matches current page
        else if (currentPage === linkPage) {
            link.classList.add('active');
        }
        // For tool pages, check if we're on a subpage of the tool
        else if (currentPage.startsWith(linkPage) && linkPage !== '/') {
            link.classList.add('active');
        }
    });
    
    // Set up logout button
    const logoutBtn = document.getElementById('nav-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
    
    // Set up user info
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            const usernameElement = document.getElementById('nav-username');
            if (usernameElement) {
                usernameElement.textContent = user.username;
            }
        } catch (e) {
            console.error('Error parsing user info:', e);
        }
    }
}

// Make logout function global
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
}

// Expose functions to global scope
window.initializeNav = initializeNav;
window.logout = logout;