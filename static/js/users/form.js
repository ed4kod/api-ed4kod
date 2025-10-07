// Работа с формами пользователей
const UsersForm = (function() {
    // Create user form HTML
    function createUserForm(user = null) {
        return `
            <form id="userForm" onsubmit="Users.handleUserSubmit(event)">
                <input type="hidden" id="user-id" value="${user ? user.id : ''}">
                
                <div class="row g-3">
                    <div class="col-12">
                        <label for="user-name" class="form-label">Имя пользователя</label>
                        <input type="text" class="form-control" id="user-name" 
                               value="${user ? user.name : ''}" required
                               placeholder="Введите имя пользователя">
                    </div>
                    
                    <div class="col-12">
                        <label for="user-email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="user-email" 
                               value="${user ? user.email : ''}" required
                               placeholder="Введите email">
                    </div>
                    
                    <div class="col-12">
                        <label for="user-status" class="form-label">Статус</label>
                        <select class="form-select" id="user-status" required>
                            <option value="">Выберите статус</option>
                            <option value="active" ${user && user.status === 'active' ? 'selected' : ''}>Активный</option>
                            <option value="inactive" ${user && user.status === 'inactive' ? 'selected' : ''}>Неактивный</option>
                            <option value="banned" ${user && user.status === 'banned' ? 'selected' : ''}>Заблокирован</option>
                        </select>
                    </div>
                </div>
                
                <div class="modal-footer mt-4 px-0 pb-0">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Отмена
                    </button>
                    <button type="submit" class="btn btn-success">
                        <i class="bi bi-check-circle me-1"></i>
                        ${user ? 'Обновить' : 'Добавить'}
                    </button>
                </div>
            </form>
        `;
    }

    // Handle form submission
    function handleUserSubmit(event) {
        event.preventDefault();

        const formData = {
            name: UsersCore.getElement('user-name').value,
            email: UsersCore.getElement('user-email').value,
            status: UsersCore.getElement('user-status').value
        };

        const userId = UsersCore.getElement('user-id').value;
        const isEdit = !!userId;

        const url = isEdit ? `${UsersCore.API_BASE}/users/${userId}` : `${UsersCore.API_BASE}/users/`;
        const method = isEdit ? 'PUT' : 'POST';

        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm me-1"></div> Сохранение...';
        submitBtn.disabled = true;

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                // Close modal
                UsersModal.closeModal();

                // Show success message
                Dashboard.showMessage(
                    isEdit ? 'Пользователь обновлен' : 'Пользователь добавлен',
                    'success'
                );

                // Reload users list
                UsersTable.loadUsers();

                // Add to activity log
                ActivityLog.addActivity(
                    isEdit ? `Пользователь "${formData.name}" обновлен` : `Добавлен новый пользователь: ${formData.name}`,
                    'success'
                );
            })
            .catch(error => {
                console.error('Error saving user:', error);
                Dashboard.showMessage('Ошибка сохранения пользователя', 'error');
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
    }

    return {
        createUserForm,
        handleUserSubmit
    };
})();