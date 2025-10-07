// Управление таблицей предметов
const ItemsTable = (function() {
    // Load items list
    function loadItems() {
        const tbody = ItemsCore.getElement('items-tbody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="spinner-border text-warning" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                </td>
            </tr>
        `;

        ItemsCore.apiCall(`${ItemsCore.API_BASE}/items/`)
            .then(items => {
                ItemsCore.setItemsCache(items);
                renderItemsTable(items);
                updateItemsCounter(items.length);
            })
            .catch(error => {
                console.error('Error loading items:', error);
                ItemsCore.showMessage(`Ошибка загрузки предметов: ${error.message}`, 'error');
                renderErrorState();
            });
    }

    function renderItemsTable(items) {
        const tbody = ItemsCore.getElement('items-tbody');
        if (!tbody) return;

        if (items.length === 0) {
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

        const users = ItemsCore.getUsersCache();

        tbody.innerHTML = items.map(item => {
            const description = item.description ? ItemsCore.escapeHtml(item.description) : '';
            const owner = users.find(u => u.id === item.owner_id);
            const ownerInfo = owner ? `${ItemsCore.escapeHtml(owner.name)} (${ItemsCore.escapeHtml(owner.email)})` : `ID: ${item.owner_id}`;

            return `
                <tr>
                    <td><span class="badge bg-secondary">${item.id}</span></td>
                    <td>
                        <i class="bi bi-tag me-2 text-muted"></i>
                        ${ItemsCore.escapeHtml(item.title)}
                    </td>
                    <td>${description}</td>
                    <td>${ownerInfo}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-warning" onclick="Items.openItemModal(${item.id})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="Items.deleteItem(${item.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderErrorState() {
        const tbody = ItemsCore.getElement('items-tbody');
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

    function updateItemsCounter(count) {
        const counter = ItemsCore.getElement('items-count');
        if (counter) {
            counter.textContent = `${count} предметов`;
        }
    }

    // Delete item with confirmation
    function deleteItem(itemId) {
        const items = ItemsCore.getItemsCache();
        const item = items.find(i => i.id === itemId);

        if (!item) {
            ItemsCore.showMessage('Предмет не найден', 'error');
            return;
        }

        if (!confirm(`Вы уверены, что хотите удалить предмет "${item.title}"?`)) {
            return;
        }

        ItemsCore.apiCall(`${ItemsCore.API_BASE}/items/${itemId}`, {
            method: 'DELETE'
        })
            .then(() => {
                ItemsCore.showMessage('Предмет успешно удален', 'success');
                if (typeof ActivityLog !== 'undefined') {
                    ActivityLog.addActivity(`Предмет "${item.title}" удален`, 'warning');
                }
                loadItems();
            })
            .catch(error => {
                console.error('Error deleting item:', error);
                ItemsCore.showMessage(`Ошибка удаления предмета: ${error.message}`, 'error');
            });
    }

    return {
        loadItems,
        deleteItem
    };
})();