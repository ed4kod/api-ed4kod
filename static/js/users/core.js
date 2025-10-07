// Основные утилиты и константы для модуля пользователей
const UsersCore = (function() {
    const API_BASE = window.location.origin + '/api';
    let currentEditId = null;

    // Helper functions
    function getStatusBadgeClass(status) {
        const classes = {
            active: 'bg-success',
            inactive: 'bg-secondary',
            banned: 'bg-danger'
        };
        return classes[status] || 'bg-secondary';
    }

    function getStatusText(status) {
        const texts = {
            active: 'Активный',
            inactive: 'Неактивный',
            banned: 'Заблокирован'
        };
        return texts[status] || 'Неизвестно';
    }

    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    function setCurrentEditId(id) {
        currentEditId = id;
    }

    function getCurrentEditId() {
        return currentEditId;
    }

    return {
        API_BASE,
        getStatusBadgeClass,
        getStatusText,
        getElement,
        setCurrentEditId,
        getCurrentEditId
    };
})();