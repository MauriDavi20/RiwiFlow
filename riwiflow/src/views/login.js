import { API } from '../api/api.js';

export function LoginView() {
  const container = document.createElement('div');
  container.className = 'auth-container';
  
  container.innerHTML = `
    <div class="auth-card">
      <h2>RiwiFlow Login</h2>
      <form id="login-form">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="email" required placeholder="Enter your email">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="password" required placeholder="Enter your password">
        </div>
        <button type="submit" class="btn-primary">Sign In</button>
        <p id="error-message" class="error-text hidden"></p>
      </form>
    </div>
  `;

  const form = container.querySelector('#login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;
    const errorMsg = container.querySelector('#error-message');

    try {
      const user = await API.login(email, password);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.hash = '#/dashboard';
      } else {
        errorMsg.textContent = 'Invalid email or password.';
        errorMsg.classList.remove('hidden');
      }
    } catch (err) {
      errorMsg.textContent = 'Server connection error.';
      errorMsg.classList.remove('hidden');
    }
  });

  return container;
}