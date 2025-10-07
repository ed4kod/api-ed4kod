// Items management functionality
const API_BASE = window.location.origin + '/api';
let usersCache = [];
let itemsCache = [];

// Utility functions (те же самые, что в users.js)
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

// Initialize items page
document.addEventListener('DOMContentLoaded', function () {
    initItemsPage();
});

async function initItemsPage() {
    await loadUsersForItems();
    await loadItems();
    initItemEventListeners();
}

function initItemEventListeners() {
    // Item form
    document.getElementById('item-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const itemData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value
        };

        const itemId = document.getElementById('item-id').value;
        const ownerId = parseInt(document.getElementById('owner-select').value);

        if (itemId) {
            updateItem(itemId, itemData);
        } else {
            createItem({...itemData, owner_id: ownerId});
        }
    });

    // Item cancel button
    document.getElementById('item-cancel-btn').addEventListener('click', resetItemForm);
}

async function loadUsersForItems() {
    try {
        const response = await fetch(`${API_BASE}/users/`);
        usersCache = await response.json();
        updateOwnerSelect();
    } catch (error) {
        console.error('Error loading users for items:', error);
        showMessage('Ошибка загрузки списка пользователей', 'error');
    }
}

function updateOwnerSelect() {
    const ownerSelect = document.getElementById('owner-select');
    const currentValue = ownerSelect.value;

    // Clear existing options except the first one
    while (ownerSelect.options.length > 1) {
        ownerSelect.remove(1);
    }

    if (usersCache.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- Нет пользователей --';
        option.disabled = true;
        ownerSelect.appendChild(option);
        return;
    }

    // Add users to select
    usersCache.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        ownerSelect.appendChild(option);
    });

    // Restore previous value if it exists
    if (currentValue && usersCache.some(user => user.id == currentValue)) {
        ownerSelect.value = currentValue;
    }
}

async function loadItems() {
    try {
        const response = await fetch(`${API_BASE}/items/`);
        itemsCache = await response.json();
        renderItems();
        updateItemsCount();
    } catch (error) {
        showMessage(`Ошибка загрузки предметов: ${error.message}`, 'error');
    }
}

function renderItems() {
    const tbody = document.getElementById('items-tbody');

    if (itemsCache.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-box display-4 d-block mb-2"></i>
                    Нет предметов
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = itemsCache.map(item => {
        const description = item.description ? escapeHtml(item.description) : '';
        const owner = usersCache.find(u => u.id === item.owner_id);
        const ownerInfo = owner ? `${owner.name} (${owner.email})` : `ID: ${item.owner_id}`;

        return `
            <tr>
                <td><span class="badge bg-secondary">${item.id}</span></td>
                <td>
                    <i class="bi bi-tag me-2 text-muted"></i>
                    ${escapeHtml(item.title)}
                </td>
                <td>${description}</td>
                <td>${escapeHtml(ownerInfo)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning me-1" 
                            onclick="editItem(${item.id}, '${escapeHtml(item.title)}', '${escapeHtml(item.description || '')}', ${item.owner_id})"
                            title="Редактировать">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="deleteItem(${item.id})"
                            title="Удалить">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateItemsCount() {
    const countElement = document.getElementById('items-count');
    if (countElement) {
        countElement.textContent = `${itemsCache.length} предметов`;
    }
}

async function createItem(itemData) {
    const submitBtn = document.getElementById('item-submit-btn');
    try {
        setLoading(true, submitBtn);
        await apiCall(`${API_BASE}/users/${itemData.owner_id}/items/`, {
            method: 'POST',
            body: JSON.stringify({
                title: itemData.title,
                description: itemData.description
            })
        });
        showMessage('Предмет успешно создан', 'success');
        resetItemForm();
        await loadItems();
    } catch (error) {
        showMessage(`Ошибка создания предмета: ${error.message}`, 'error');
    } finally {
        setLoading(false, submitBtn);
    }
}

async function updateItem(itemId, itemData) {
    const submitBtn = document.getElementById('item-submit-btn');
    try {
        setLoading(true, submitBtn);
        await apiCall(`${API_BASE}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(itemData)
        });
        showMessage('Предмет успешно обновлен', 'success');
        resetItemForm();
        await loadItems();
    } catch (error) {
        showMessage(`Ошибка обновления предмета: ${error.message}`, 'error');
    } finally {
        setLoading(false, submitBtn);
    }
}

async function deleteItem(itemId) {
    const item = itemsCache.find(i => i.id === itemId);
    if (!confirm(`Вы уверены, что хотите удалить предмет "${item.title}"?`)) {
        return;
    }

    try {
        await apiCall(`${API_BASE}/items/${itemId}`, {
            method: 'DELETE'
        });
        showMessage('Предмет успешно удален', 'success');
        await loadItems();
    } catch (error) {
        showMessage(`Ошибка удаления предмета: ${error.message}`, 'error');
    }
}

function editItem(id, title, description, ownerId) {
    document.getElementById('item-id').value = id;
    document.getElementById('title').value = title;
    document.getElementById('description').value = description || '';
    document.getElementById('owner-select').value = ownerId;
    document.getElementById('item-form-title').innerHTML = '<i class="bi bi-pencil me-2"></i>Редактировать предмет';
    document.getElementById('item-submit-btn').innerHTML = '<i class="bi bi-check-circle me-1"></i>Обновить';
    document.getElementById('item-cancel-btn').style.display = 'inline-block';

    // Scroll to form
    const formSection = document.getElementById('item-form-section');
    if (formSection) {
        formSection.scrollIntoView({behavior: 'smooth'});
    }
}

function resetItemForm() {
    document.getElementById('item-form').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('owner-select').value = '';
    document.getElementById('item-form-title').innerHTML = '<i class="bi bi-plus-square me-2"></i>Добавить предмет';
    document.getElementById('item-submit-btn').innerHTML = '<i class="bi bi-plus-circle me-1"></i>Добавить';
    document.getElementById('item-cancel-btn').style.display = 'none';
}

// Make functions globally available
window.editItem = editItem;
window.deleteItem = deleteItem;
window.loadItems = loadItems;