// 用户登录
async function login() {
    // 确保获取登录表单中的元素
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
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
            // 使用JWT令牌而不是用户对象
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify({
                id: data.id,
                username: data.username
            }));
            window.location.href = '/';
        } else {
            alert(data.error || '登录失败');
        }
    } catch (error) {
        console.error('登录错误:', error);
        alert('登录过程中发生错误');
    }
}

// 用户注册
async function register() {
    // 确保获取注册表单中的元素
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
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
            alert('注册成功，请登录');
            window.location.href = '/login.html';
        } else {
            alert(data.error || '注册失败');
        }
    } catch (error) {
        console.error('注册错误:', error);
        alert('注册过程中发生错误');
    }
}

// 检查用户是否已登录
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!token || !currentUser) {
        redirectToLogin();
        return false;
    }
    
    return true;
}

// 重定向到登录页面
function redirectToLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
}

// 退出登录
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
}