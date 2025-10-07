// Управление модальным окном пользователей
const UsersModal = (function() {
    // Open modal for adding/editing user
    function openUserModal(userId = null) {
        UsersCore.setCurrentEditId(userId);
        const modal = new bootstrap.Modal(UsersCore.getElement('userModal'));
        const modalTitle = UsersCore.getElement('userModalLabel');
        const modalBody = document.querySelector('#userModal .modal-body');

        if (userId) {
            modalTitle.innerHTML = '<i class="bi bi-person-gear me-2"></i>Редактировать пользователя';
            loadUserForm(userId, modalBody);
        } else {
            modalTitle.innerHTML = '<i class="bi bi-person-plus me-2"></i>Добавить пользователя';
            loadUserForm(null, modalBody);
        }

        modal.show();
    }

    // Load user form into modal
    function loadUserForm(userId, modalBody) {
        if (userId) {
            // Load existing user data
            modalBody.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                </div>
            `;

            fetch(`${UsersCore.API_BASE}/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    modalBody.innerHTML = UsersForm.createUserForm(user);
                })
                .catch(error => {
                    console.error('Error loading user:', error);
                    modalBody.innerHTML = '<div class="alert alert-danger">Ошибка загрузки данных</div>';
                });
        } else {
            // New user form
            modalBody.innerHTML = UsersForm.createUserForm();
        }
    }

    function closeModal() {
        const modal = bootstrap.Modal.getInstance(UsersCore.getElement('userModal'));
        if (modal) {
            modal.hide();
        }
    }

    return {
        openUserModal,
        closeModal
    };
})();