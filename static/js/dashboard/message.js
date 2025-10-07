// Система сообщений
const DashboardMessage = (function() {
    function showMessage(message, type = 'success') {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };

        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100%);
            background: ${colors[type] || colors.success};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.3s ease;
            font-weight: 500;
            max-width: 90%;
            text-align: center;
        `;

        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        setTimeout(() => {
            messageElement.style.transform = 'translateX(-50%) translateY(-100%)';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 300);
        }, 3000);
    }

    return {
        showMessage
    };
})();