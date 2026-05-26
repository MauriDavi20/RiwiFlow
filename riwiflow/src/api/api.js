const BASE_URL = 'http://localhost:3000';

export const API = {
  async login(email, password) {
    const response = await fetch(`${BASE_URL}/users?email=${email}&password=${password}`);
    const users = await response.json();
    return users.length > 0 ? users[0] : null;
  },

  async getUsers() {
    const response = await fetch(`${BASE_URL}/users`);
    return await response.json();
  },

  async getTasks() {
    const response = await fetch(`${BASE_URL}/tasks`);
    return await response.json();
  },

  async createTask(taskData) {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return await response.json();
  },

  async updateTask(taskId, taskData) {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return await response.json();
  },

  async deleteTask(taskId) {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
};