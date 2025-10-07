// Управление модальным окном предметов
const ItemsModal = (function() {
    // Open modal for adding/editing item
    function openItemModal(itemId = null) {
        ItemsCore.setCurrentEditId(itemId);
        const modal = new bootstrap.Modal(ItemsCore.getElement('itemModal'));
        const modalTitle = ItemsCore.getElement('itemModalLabel');
        const modalBody = document.querySelector('#itemModal .modal-body');

        if (itemId) {
            modalTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Редактировать предмет';
            loadItemForm(itemId, modalBody);
        } else {
            modalTitle.innerHTML = '<i class="bi bi-plus-square me-2"></i>Добавить предмет';
            loadItemForm(null, modalBody);
        }

        modal.show();
    }

    // Load item form into modal
    function loadItemForm(itemId, modalBody) {
        if (itemId) {
            // Load existing item data
            modalBody.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-warning" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                </div>
            `;

            fetch(`${ItemsCore.API_BASE}/items/${itemId}`)
                .then(response => response.json())
                .then(item => {
                    modalBody.innerHTML = ItemsForm.createItemForm(item);
                })
                .catch(error => {
                    console.error('Error loading item:', error);
                    modalBody.innerHTML = '<div class="alert alert-danger">Ошибка загрузки данных</div>';
                });
        } else {
            // New item form
            modalBody.innerHTML = ItemsForm.createItemForm();
        }
    }

    function closeModal() {
        const modal = bootstrap.Modal.getInstance(ItemsCore.getElement('itemModal'));
        if (modal) {
            modal.hide();
        }
    }

    return {
        openItemModal,
        closeModal
    };
})();