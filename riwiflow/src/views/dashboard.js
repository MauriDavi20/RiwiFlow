import { API } from '../api/api.js';

export function DashboardView() {
  const container = document.createElement('div');
  container.className = 'dashboard-container';

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const isAdmin = currentUser.role === 'admin';

  // Structure Layout
  container.innerHTML = `
    <header class="main-header">
      <div class="logo-area">
        <h1>RiwiFlow Tabler</h1>
        <span class="badge ${currentUser.role}">${currentUser.role.toUpperCase()}</span>
      </div>
      <div class="user-control">
        <span>Welcome, <strong>${currentUser.name}</strong></span>
        <button id="logout-btn" class="btn-secondary">Logout</button>
      </div>
    </header>

    <main class="kanban-workspace">
      ${isAdmin ? `
        <section class="task-creation-panel">
          <h3>Create New Task</h3>
          <form id="task-form">
            <input type="text" id="task-title" placeholder="Task Title" required>
            <textarea id="task-desc" placeholder="Task Description" required></textarea>
            <select id="task-user" required>
              <option value="">Assign Coder...</option>
            </select>
            <button type="submit" class="btn-success">Add Task</button>
          </form>
        </section>
      ` : ''}

      <div class="kanban-board">
        <div class="kanban-column" data-status="todo"><h2>To Do</h2><div class="task-list"></div></div>
        <div class="kanban-column" data-status="in progress"><h2>In Progress</h2><div class="task-list"></div></div>
        <div class="kanban-column" data-status="in review"><h2>In Review</h2><div class="task-list"></div></div>
        <div class="kanban-column" data-status="done"><h2>Done</h2><div class="task-list"></div></div>
      </div>
    </main>

    <div id="edit-modal" class="modal hidden"></div>
  `;

  // Log Out Execution
  container.querySelector('#logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.hash = '#/login';
  });

  // Load Data and Render Board
  async function loadBoard() {
    const tasks = await API.getTasks();
    const users = await API.getUsers();

    // Populate user assignment dropdown if admin
    if (isAdmin) {
      const selectUser = container.querySelector('#task-user');
      selectUser.innerHTML = '<option value="">Assign Coder...</option>';
      users.forEach(u => {
        selectUser.innerHTML += `<option value="${u.id}">${u.name} (${u.role})</option>`;
      });
    }

    // Clear Lists
    container.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

    // Distribute Tasks to Columns (HU-04 / HU-07)
    tasks.forEach(task => {
      const column = container.querySelector(`.kanban-column[data-status="${task.status}"] .task-list`);
      if (!column) return;

      const assignedUser = users.find(u => String(u.id) === String(task.userId));
      const isAssignedToMe = String(task.userId) === String(currentUser.id);
      
      // Authorization Check for editing capabilities (HU-05 / HU-06)
      const canEdit = isAdmin || isAssignedToMe;

      const taskCard = document.createElement('div');
      taskCard.className = 'task-card';
      taskCard.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description}</p>
        <div class="card-footer">
          <span class="user-tag">👤 ${assignedUser ? assignedUser.name : 'Unassigned'}</span>
          ${canEdit ? `<button class="btn-edit-task btn-small" data-id="${task.id}">Edit</button>` : ''}
          ${isAdmin ? `<button class="btn-delete-task btn-small btn-danger" data-id="${task.id}">Delete</button>` : ''}
        </div>
      `;

      // Event handlers for actions
      if (canEdit) {
        taskCard.querySelector('.btn-edit-task').addEventListener('click', () => openEditModal(task, users));
      }
      if (isAdmin) {
        taskCard.querySelector('.btn-delete-task').addEventListener('click', () => deleteTask(task.id));
      }

      column.appendChild(taskCard);
    });
  }

  // Handle Task Creation (HU-03)
  if (isAdmin) {
    const taskForm = container.querySelector('#task-form');
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newTask = {
        title: container.querySelector('#task-title').value,
        description: container.querySelector('#task-desc').value,
        status: 'todo', // Default initial state required
        userId: container.querySelector('#task-user').value
      };

      await API.createTask(newTask);
      taskForm.reset();
      loadBoard();
    });
  }

  // Handle Deletions
  async function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
      await API.deleteTask(id);
      loadBoard();
    }
  }

  // Handle Modals & Contextual Permissions for Updates (HU-05 / HU-06)
  function openEditModal(task, users) {
    const modal = container.querySelector('#edit-modal');
    modal.classList.remove('hidden');

    modal.innerHTML = `
      <div class="modal-content">
        <h3>Modify Task Specifications</h3>
        <form id="update-form">
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="edit-title" value="${task.title}" ${!isAdmin ? 'disabled' : 'required'}>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="edit-desc" required>${task.description}</textarea>
          </div>
          <div class="form-group">
            <label>Status (Flow State)</label>
            <select id="edit-status">
              <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="in progress" ${task.status === 'in progress' ? 'selected' : ''}>In Progress</option>
              <option value="in review" ${task.status === 'in review' ? 'selected' : ''}>In Review</option>
              <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
            </select>
          </div>
          <div class="form-group">
            <label>Assignee</label>
            <select id="edit-user" ${!isAdmin ? 'disabled' : ''}>
              ${users.map(u => `<option value="${u.id}" ${String(u.id) === String(task.userId) ? 'selected' : ''}>${u.name}</option>`).join('')}
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-success">Save Changes</button>
            <button type="button" id="close-modal" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    `;

    modal.querySelector('#close-modal').addEventListener('click', () => modal.classList.add('hidden'));

    modal.querySelector('#update-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const updatedData = {
        id: task.id,
        title: modal.querySelector('#edit-title').value,
        description: modal.querySelector('#edit-desc').value,
        status: modal.querySelector('#edit-status').value,
        userId: modal.querySelector('#edit-user').value
      };

      await API.updateTask(task.id, updatedData);
      modal.classList.add('hidden');
      loadBoard();
    });
  }

  // Trigger base load
  loadBoard();
  return container;
}