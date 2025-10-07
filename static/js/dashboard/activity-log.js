// Журнал действий
const DashboardActivityLog = (function() {
    let activityLog = [];

    function addActivity(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('ru-RU');
        const activity = {
            message: message,
            type: type,
            timestamp: timestamp
        };

        activityLog.unshift(activity);

        if (activityLog.length > 10) {
            activityLog = activityLog.slice(0, 10);
        }

        renderActivityLog();
    }

    function renderActivityLog() {
        const logContainer = DashboardCore.getElement('activity-log');
        if (!logContainer) return;

        if (activityLog.length === 0) {
            logContainer.innerHTML = `
                <div class="list-group-item text-center text-muted py-4">
                    <i class="bi bi-inbox display-6 d-block mb-2"></i>
                    Нет действий
                </div>
            `;
            return;
        }

        logContainer.innerHTML = activityLog.map(activity => {
            const iconClass = {
                'info': 'bi-info-circle text-primary',
                'success': 'bi-check-circle text-success',
                'error': 'bi-x-circle text-danger',
                'warning': 'bi-exclamation-circle text-warning'
            }[activity.type] || 'bi-info-circle text-primary';

            return `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <i class="bi ${iconClass} me-2"></i>
                            <span>${activity.message}</span>
                        </div>
                        <small class="text-muted">${activity.timestamp}</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    function refreshActivityLog() {
        addActivity('Журнал действий обновлен', 'info');
        DashboardMessage.showMessage('Журнал обновлен', 'info');
    }

    function clearActivityLog() {
        activityLog = [];
        renderActivityLog();
        DashboardMessage.showMessage('Лог очищен', 'info');
    }

    // Demo function
    function simulateRandomActivity() {
        const actions = [
            {message: 'Новый пользователь зарегистрирован', type: 'success'},
            {message: 'Предмет добавлен в каталог', type: 'success'},
            {message: 'Данные синхронизированы', type: 'info'},
            {message: 'Резервное копирование выполнено', type: 'info'}
        ];

        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        addActivity(randomAction.message, randomAction.type);
    }

    return {
        addActivity,
        refreshActivityLog,
        clearActivityLog,
        simulateRandomActivity
    };
})();