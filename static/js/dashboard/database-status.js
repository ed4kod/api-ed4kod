// Статус базы данных
const DashboardDatabaseStatus = (function() {
    async function checkDatabaseStatus() {
        const startTime = performance.now();
        DashboardCore.toggleSpinner('db-spinner', true);

        try {
            const response = await fetch(`${DashboardCore.API_BASE}/health/database`);
            const data = await response.json();

            const responseTime = performance.now() - startTime;

            if (data.status === 'connected' || response.ok) {
                setStatus('success', 'Подключено');
                updateResponseTime(responseTime, 'success');
            } else {
                setStatus('warning', 'Проблема');
                updateResponseTime('Ошибка', 'warning');
            }

        } catch (error) {
            const responseTime = performance.now() - startTime;
            setStatus('error', 'Ошибка');
            updateResponseTime(responseTime, 'error');
        } finally {
            DashboardCore.toggleSpinner('db-spinner', false);
        }
    }

    function setStatus(type, status) {
        const statusElement = DashboardCore.getElement('database-status');
        const iconElement = DashboardCore.getElement('database-icon');

        if (!statusElement || !iconElement) return;

        statusElement.textContent = status;

        const config = {
            success: {class: 'text-success', icon: 'bi-database-check'},
            warning: {class: 'text-warning', icon: 'bi-database-exclamation'},
            error: {class: 'text-danger', icon: 'bi-database-x'}
        }[type];

        statusElement.className = `mb-2 fw-bold ${config.class}`;
        iconElement.className = `bi ${config.icon} display-6 ${config.class}`;
    }

    function updateResponseTime(time, type) {
        const badgeElement = DashboardCore.getElement('db-response-time');
        if (!badgeElement) return;

        const timeText = typeof time === 'number' ? `${Math.round(time)}ms` : time;
        const badgeClass = {
            success: 'badge bg-success bg-opacity-10 text-success border-0 px-3 py-2',
            warning: 'badge bg-warning bg-opacity-10 text-warning border-0 px-3 py-2',
            error: 'badge bg-danger bg-opacity-10 text-danger border-0 px-3 py-2'
        }[type];

        badgeElement.innerHTML = `
            <i class="bi bi-clock me-1"></i>
            <span class="response-time">${timeText}</span>
        `;
        badgeElement.className = badgeClass;
    }

    function setupAutoRefresh() {
        setInterval(() => {
            checkDatabaseStatus();
        }, 30000);
    }

    function init() {
        checkDatabaseStatus();
        setupAutoRefresh();
    }

    return {
        init
    };
})();