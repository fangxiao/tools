document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = '/';
        return;
    }

    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const loginTab = document.querySelector('.tab[data-tab="login"]');
    const registerTab = document.querySelector('.tab[data-tab="register"]');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });

    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    // Login form submission
    document.getElementById('login-form-content').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Save user info to localStorage
                localStorage.setItem('currentUser', JSON.stringify(data));
                window.location.href = '/';
            } else {
                errorDiv.textContent = data.error;
            }
        } catch (error) {
            errorDiv.textContent = '登录过程中发生错误';
        }
    });

    // Registration form submission
    document.getElementById('register-form-content').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const errorDiv = document.getElementById('register-error');
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Save user info to localStorage
                localStorage.setItem('currentUser', JSON.stringify(data));
                window.location.href = '/';
            } else {
                errorDiv.textContent = data.error;
            }
        } catch (error) {
            errorDiv.textContent = '注册过程中发生错误';
        }
    });
});