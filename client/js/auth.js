document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token
        window.API.getMe()
            .then(() => {
                window.location.href = 'dashboard.html';
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            });
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const toggleText = document.getElementById('toggle-text');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');

    let isLogin = true;

    if (toggleFormBtn) {
        toggleFormBtn.addEventListener('click', () => {
            isLogin = !isLogin;
            
            if (isLogin) {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
                toggleText.textContent = "Don't have an account?";
                toggleFormBtn.textContent = "Sign Up";
                formTitle.textContent = "Welcome Back";
                formSubtitle.textContent = "Enter your credentials to access your inventory";
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                toggleText.textContent = "Already have an account?";
                toggleFormBtn.textContent = "Sign In";
                formTitle.textContent = "Create Account";
                formSubtitle.textContent = "Sign up to start managing your inventory";
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const btn = document.getElementById('login-btn');
            
            try {
                btn.disabled = true;
                btn.textContent = 'Signing in...';
                
                const data = await window.API.login(email, password);
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data._id,
                    username: data.username,
                    role: data.role
                }));
                
                window.showToast('Login successful!');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (error) {
                window.showToast(error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Sign In';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const btn = document.getElementById('reg-btn');
            
            try {
                btn.disabled = true;
                btn.textContent = 'Creating account...';
                
                const data = await window.API.register(username, email, password);
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data._id,
                    username: data.username,
                    role: data.role
                }));
                
                window.showToast('Registration successful!');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (error) {
                window.showToast(error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        });
    }
});
