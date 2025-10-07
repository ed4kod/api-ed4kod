// Главный файл инициализации
const Dashboard = (function() {
    function init() {
        DashboardActivityLog.addActivity('Дашборд загружен', 'info');
        DashboardStats.refreshDashboard();
        DashboardDatabaseStatus.init();

        // Demo: random activities every 30 seconds
        setInterval(DashboardActivityLog.simulateRandomActivity, 30000);
    }

    return {
        init,
        refreshDashboard: DashboardStats.refreshDashboard,
        showMessage: DashboardMessage.showMessage,
        toggleSpinner: DashboardCore.toggleSpinner
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Dashboard.init();
});

// Make functions globally available
window.dashboard = Dashboard;
window.activityLog = DashboardActivityLog;
window.databaseStatus = DashboardDatabaseStatus;