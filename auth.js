// User management
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Debug logging
function debugLog(message, data = null) {
    console.log(`[Auth Debug] ${message}`, data || '');
}

// Update UI based on auth state
function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) {
        debugLog('Auth buttons container not found!');
        return;
    }

    if (currentUser) {
        authButtons.innerHTML = `
            <span class="user-name">Welcome, ${currentUser.name}</span>
            <button class="logout-btn">Logout</button>
        `;
        // Add logout listener
        document.querySelector('.logout-btn')?.addEventListener('click', handleLogout);
    } else {
        authButtons.innerHTML = `
            <button id="loginBtn" class="login-btn">Login</button>
            <button id="registerBtn" class="register-btn">Register</button>
        `;
        // Add login/register listeners
        setupAuthListeners();
    }
}

// Setup auth button listeners
function setupAuthListeners() {
    debugLog('Setting up auth listeners');
    
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    debugLog('Login button exists:', loginBtn !== null);
    debugLog('Register button exists:', registerBtn !== null);

    loginBtn?.addEventListener('click', () => {
        debugLog('Login button clicked');
        openLoginModal();
    });

    registerBtn?.addEventListener('click', () => {
        debugLog('Register button clicked');
        openRegisterModal();
    });
}

// Modal handling functions
function openLoginModal() {
    debugLog('Opening login modal');
    const modal = document.getElementById('loginModal');
    if (!modal) {
        debugLog('Login modal not found!');
        return;
    }
    modal.style.display = 'block';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openRegisterModal() {
    debugLog('Opening register modal');
    const modal = document.getElementById('registerModal');
    if (!modal) {
        debugLog('Register modal not found!');
        return;
    }
    modal.style.display = 'block';
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    debugLog('Login form submitted');
    
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            debugLog('Login successful');
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateAuthUI();
            closeLoginModal();
            document.getElementById('loginForm')?.reset();
            showToast('Login successful!');
        } else {
            showToast('Invalid email or password', 'error');
        }
    } catch (error) {
        debugLog('Login error:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

// Handle register form submission
function handleRegister(event) {
    event.preventDefault();
    debugLog('Register form submitted');
    
    const name = document.getElementById('registerName')?.value.trim();
    const email = document.getElementById('registerEmail')?.value.trim();
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.some(user => user.email === email)) {
            showToast('Email already registered!', 'error');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            name,
            email,
            password
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login after registration
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        debugLog('Registration successful');
        updateAuthUI();
        closeRegisterModal();
        document.getElementById('registerForm')?.reset();
        showToast('Registration successful!');
    } catch (error) {
        debugLog('Registration error:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

// Handle logout
function handleLogout() {
    debugLog('Logout clicked');
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showToast('Logged out successfully');
}

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', () => {
    debugLog('Initializing auth system');
    updateAuthUI();
    
    // Setup form submit handlers
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
});

// Fallback for browsers with disabled JavaScript
if (typeof window.localStorage === 'undefined') {
    debugLog('localStorage not available');
    document.querySelectorAll('form').forEach(form => {
        form.setAttribute('action', '#');
        form.setAttribute('method', 'POST');
    });
} 