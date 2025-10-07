// Главный файл инициализации модуля пользователей
const Users = (function() {
    function init() {
        UsersTable.loadUsers();
    }

    function openUserModal(userId = null) {
        UsersModal.openUserModal(userId);
    }

    function handleUserSubmit(event) {
        UsersForm.handleUserSubmit(event);
    }

    function deleteUser(userId, userName) {
        UsersTable.deleteUser(userId, userName);
    }

    function loadUsers() {
        UsersTable.loadUsers();
    }

    return {
        init,
        openUserModal,
        handleUserSubmit,
        deleteUser,
        loadUsers
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем только если находимся на странице пользователей
    if (UsersCore.getElement('users-tbody')) {
        Users.init();
    }
});

// Make functions globally available
window.Users = Users;