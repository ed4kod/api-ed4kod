// Управление таблицей пользователей
const UsersTable = (function() {
    // Load users list
    function loadUsers() {
        const tbody = UsersCore.getElement('users-tbody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                </td>
            </tr>
        `;

        fetch(`${UsersCore.API_BASE}/users/`)
            .then(response => response.json())
            .then(users => {
                renderUsersTable(users);
                updateUsersCounter(users.length);
            })
            .catch(error => {
                console.error('Error loading users:', error);
                renderErrorState();
            });
    }

    function renderUsersTable(users) {
        const tbody = UsersCore.getElement('users-tbody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        <i class="bi bi-people display-6 d-block mb-2"></i>
                        Нет пользователей
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td class="fw-bold">#${user.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-sm bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2">
                            <i class="bi bi-person text-success"></i>
                        </div>
                        ${user.name}
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${UsersCore.getStatusBadgeClass(user.status)}">
                        ${UsersCore.getStatusText(user.status)}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="Users.openUserModal(${user.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="Users.deleteUser(${user.id}, '${user.name}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderErrorState() {
        const tbody = UsersCore.getElement('users-tbody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Ошибка загрузки данных
                </td>
            </tr>
        `;
    }

    function updateUsersCounter(count) {
        const counter = UsersCore.getElement('users-count');
        if (counter) {
            counter.textContent = `${count} пользователей`;
        }
    }

    // Delete user with confirmation
    function deleteUser(userId, userName) {
        if (!confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
            return;
        }

        fetch(`${UsersCore.API_BASE}/users/${userId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');

                Dashboard.showMessage('Пользователь удален', 'success');
                ActivityLog.addActivity(`Пользователь "${userName}" удален`, 'warning');
                loadUsers();
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                Dashboard.showMessage('Ошибка удаления пользователя', 'error');
            });
    }

    return {
        loadUsers,
        deleteUser
    };
})();