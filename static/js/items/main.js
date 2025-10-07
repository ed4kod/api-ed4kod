// Главный файл инициализации модуля предметов
const Items = (function () {
    async function init() {
        await loadUsersForItems();
        await ItemsTable.loadItems();
    }

    async function loadUsersForItems() {
        try {
            const users = await ItemsCore.apiCall(`${ItemsCore.API_BASE}/users/`);
            ItemsCore.setUsersCache(users);
        } catch (error) {
            console.error('Error loading users for items:', error);
            ItemsCore.showMessage('Ошибка загрузки списка пользователей', 'error');
        }
    }

    function openItemModal(itemId = null) {
        ItemsModal.openItemModal(itemId);
    }

    function handleItemSubmit(event) {
        ItemsForm.handleItemSubmit(event);
    }

    function deleteItem(itemId) {
        ItemsTable.deleteItem(itemId);
    }

    function loadItems() {
        ItemsTable.loadItems();
    }

    return {
        init,
        openItemModal,
        handleItemSubmit,
        deleteItem,
        loadItems
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Инициализируем только если находимся на странице предметов
    if (ItemsCore.getElement('items-tbody')) {
        Items.init();
    }
});

// Make functions globally available
window.Items = Items;