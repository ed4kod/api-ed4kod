// Работа с формами предметов
const ItemsForm = (function () {
    // Create item form HTML
    function createItemForm(item = null) {
        const users = ItemsCore.getUsersCache();

        return `
            <form id="itemForm" onsubmit="Items.handleItemSubmit(event)">
                <input type="hidden" id="item-id" value="${item ? item.id : ''}">
                
                <div class="row g-3">
                    <div class="col-12">
                        <label for="item-title" class="form-label">Название предмета</label>
                        <input type="text" class="form-control" id="item-title" 
                               value="${item ? ItemsCore.escapeHtml(item.title) : ''}" required
                               placeholder="Введите название предмета">
                    </div>
                    
                    <div class="col-12">
                        <label for="item-description" class="form-label">Описание</label>
                        <textarea class="form-control" id="item-description" rows="3" 
                                  placeholder="Введите описание предмета">${item ? ItemsCore.escapeHtml(item.description || '') : ''}</textarea>
                    </div>
                    
                    <div class="col-12">
                        <label for="item-owner-select" class="form-label">Владелец</label>
                        <select class="form-select" id="item-owner-select" required>
                            <option value="">-- Выберите пользователя --</option>
                            ${users.map(user => `
                                <option value="${user.id}" ${item && item.owner_id === user.id ? 'selected' : ''}>
                                    ${ItemsCore.escapeHtml(user.name)} (${ItemsCore.escapeHtml(user.email)})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="modal-footer mt-4 px-0 pb-0">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Отмена
                    </button>
                    <button type="submit" class="btn btn-warning">
                        <i class="bi bi-check-circle me-1"></i>
                        ${item ? 'Обновить' : 'Добавить'}
                    </button>
                </div>
            </form>
        `;
    }

    // Handle form submission
    function handleItemSubmit(event) {
        event.preventDefault();

        const formData = {
            title: ItemsCore.getElement('item-title').value,
            description: ItemsCore.getElement('item-description').value,
            owner_id: parseInt(ItemsCore.getElement('item-owner-select').value)
        };

        const itemId = ItemsCore.getElement('item-id').value;
        const isEdit = !!itemId;

        const url = isEdit ? `${ItemsCore.API_BASE}/items/${itemId}` : `${ItemsCore.API_BASE}/users/${formData.owner_id}/items/`;
        const method = isEdit ? 'PUT' : 'POST';

        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        ItemsCore.setLoading(true, submitBtn);

        ItemsCore.apiCall(url, {
            method: method,
            body: JSON.stringify(isEdit ? {title: formData.title, description: formData.description} : formData)
        })
            .then(data => {
                // Close modal
                ItemsModal.closeModal();

                // Show success message
                ItemsCore.showMessage(
                    isEdit ? 'Предмет обновлен' : 'Предмет добавлен',
                    'success'
                );

                // Reload items list
                ItemsTable.loadItems();

                // Add to activity log
                if (typeof ActivityLog !== 'undefined') {
                    ActivityLog.addActivity(
                        isEdit ? `Предмет "${formData.title}" обновлен` : `Добавлен новый предмет: ${formData.title}`,
                        'success'
                    );
                }
            })
            .catch(error => {
                console.error('Error saving item:', error);
                ItemsCore.showMessage(`Ошибка сохранения предмета: ${error.message}`, 'error');
            })
            .finally(() => {
                ItemsCore.setLoading(false, submitBtn);
            });
    }

    return {
        createItemForm,
        handleItemSubmit
    };
})();