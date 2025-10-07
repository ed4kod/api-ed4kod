// Основные утилиты и константы для модуля предметов
const ItemsCore = (function() {
    const API_BASE = window.location.origin + '/api';
    let usersCache = [];
    let itemsCache = [];
    let currentEditId = null;

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

    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    // Cache management
    function setUsersCache(users) {
        usersCache = users;
    }

    function getUsersCache() {
        return usersCache;
    }

    function setItemsCache(items) {
        itemsCache = items;
    }

    function getItemsCache() {
        return itemsCache;
    }

    function setCurrentEditId(id) {
        currentEditId = id;
    }

    function getCurrentEditId() {
        return currentEditId;
    }

    return {
        API_BASE,
        showMessage,
        setLoading,
        escapeHtml,
        apiCall,
        getElement,
        setUsersCache,
        getUsersCache,
        setItemsCache,
        getItemsCache,
        setCurrentEditId,
        getCurrentEditId
    };
})();