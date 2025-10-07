// Users management functionality
const API_BASE = window.location.origin + '/api';
let usersCache = [];

// Utility functions
function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    const alertClass = type === 'success' ? 'alert-success' :
        type === 'error' ? 'alert-danger' :
            type === 'warning' ? 'alert-warning' : 'alert-info';

    messageDiv.innerHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <strong>${type === 'success' ? '✓' : type === 'error' ? '✗' : '⚠'}</strong>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    setTimeout(() => {
        const alert = messageDiv.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

function setLoading(loading, button = null) {
    if (button) {
        if (loading) {
            button.disabled = true;
            const originalText = button.innerHTML;
            button.setAttribute('data-original-text', originalText);
            button.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Загрузка...`;
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
        }
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function apiCall(url, options = {}) {
    try {
        console.log('Making API call to:', url);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            let errorDetail = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                // Если не удалось распарсить JSON
            }
            throw new Error(errorDetail);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Initialize users page
document.addEventListener('DOMContentLoaded', function () {
    initUsersPage();
});

async function initUsersPage() {
    await loadUsers();
    initUserEventListeners();
}

function initUserEventListeners() {
    // User form
    document.getElementById('user-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const userData = {
            email: document.getElementById('email').value,
            name: document.getElementById('name').value
        };

        const userId = document.getElementById('user-id').value;

        if (userId) {
            updateUser(userId, userData);
        } else {
            createUser(userData);
        }
    });

    // User cancel button
    document.getElementById('user-cancel-btn').addEventListener('click', resetUserForm);
}

async function loadUsers() {
    try {
        console.log('Loading users from:', `${API_BASE}/users/`);

        const response = await fetch(`${API_BASE}/users/`);

        console.log('Response:', response);

        if (!response.ok) {
            throw new Error(`Network error: ${response.status} ${response.statusText}`);
        }

        usersCache = await response.json();
        console.log('Users loaded:', usersCache);

        renderUsers();
        updateUsersCount();
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage(`Ошибка загрузки пользователей: ${error.message}`, 'error');
    }
}

function renderUsers() {
    const tbody = document.getElementById('users-tbody');

    if (usersCache.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-people display-4 d-block mb-2"></i>
                    Нет пользователей
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = usersCache.map(user => `
        <tr>
            <td><span class="badge bg-secondary">${user.id}</span></td>
            <td>
                <i class="bi bi-envelope me-2 text-muted"></i>
                ${escapeHtml(user.email)}
            </td>
            <td>${escapeHtml(user.name)}</td>
            <td>
                <span class="badge ${user.items && user.items.length > 0 ? 'bg-info' : 'bg-secondary'}">
                    ${user.items ? user.items.length : 0}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="editUser(${user.id}, '${escapeHtml(user.email)}', '${escapeHtml(user.name)}')"
                        title="Редактировать">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="deleteUser(${user.id})"
                        title="Удалить">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateUsersCount() {
    const countElement = document.getElementById('users-count');
    if (countElement) {
        countElement.textContent = `${usersCache.length} пользователей`;
    }
}

async function createUser(userData) {
    const submitBtn = document.getElementById('user-submit-btn');
    try {
        setLoading(true, submitBtn);
        await apiCall(`${API_BASE}/users/`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        showMessage('Пользователь успешно создан', 'success');
        resetUserForm();
        await loadUsers();
    } catch (error) {
        showMessage(`Ошибка создания пользователя: ${error.message}`, 'error');
    } finally {
        setLoading(false, submitBtn);
    }
}

async function updateUser(userId, userData) {
    const submitBtn = document.getElementById('user-submit-btn');
    try {
        setLoading(true, submitBtn);
        await apiCall(`${API_BASE}/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
        showMessage('Пользователь успешно обновлен', 'success');
        resetUserForm();
        await loadUsers();
    } catch (error) {
        showMessage(`Ошибка обновления пользователя: ${error.message}`, 'error');
    } finally {
        setLoading(false, submitBtn);
    }
}

async function deleteUser(userId) {
    const user = usersCache.find(u => u.id === userId);
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${user.name}"? Все его предметы также будут удалены.`)) {
        return;
    }

    try {
        await apiCall(`${API_BASE}/users/${userId}`, {
            method: 'DELETE'
        });
        showMessage('Пользователь успешно удален', 'success');
        await loadUsers();
    } catch (error) {
        showMessage(`Ошибка удаления пользователя: ${error.message}`, 'error');
    }
}

function editUser(id, email, name) {
    document.getElementById('user-id').value = id;
    document.getElementById('email').value = email;
    document.getElementById('name').value = name;
    document.getElementById('user-form-title').innerHTML = '<i class="bi bi-pencil me-2"></i>Редактировать пользователя';
    document.getElementById('user-submit-btn').innerHTML = '<i class="bi bi-check-circle me-1"></i>Обновить';
    document.getElementById('user-cancel-btn').style.display = 'inline-block';

    // Scroll to form
    const formSection = document.getElementById('user-form-section');
    if (formSection) {
        formSection.scrollIntoView({behavior: 'smooth'});
    }
}

function resetUserForm() {
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-form-title').innerHTML = '<i class="bi bi-person-plus me-2"></i>Добавить пользователя';
    document.getElementById('user-submit-btn').innerHTML = '<i class="bi bi-plus-circle me-1"></i>Добавить';
    document.getElementById('user-cancel-btn').style.display = 'none';
}

// Make functions globally available
window.editUser = editUser;
window.deleteUser = deleteUser;
window.loadUsers = loadUsers;