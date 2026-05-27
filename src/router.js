import { LoginView } from './views/login.js';
import { DashboardView } from './views/dashboard.js';

const routes = {
  '#/login': LoginView,
  '#/dashboard': DashboardView
};

export function router() {
  const app = document.getElementById('app');
  const currentHash = window.location.hash || '#/login';
  
  // Auth Guard protection
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (!currentUser && currentHash !== '#/login') {
    window.location.hash = '#/login';
    return;
  }

  if (currentUser && currentHash === '#/login') {
    window.location.hash = '#/dashboard';
    return;
  }

  const viewComponent = routes[currentHash];
  if (viewComponent) {
    app.innerHTML = '';
    app.appendChild(viewComponent());
  } else {
    window.location.hash = '#/login';
  }
}