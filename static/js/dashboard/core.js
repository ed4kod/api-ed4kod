// Основные утилиты и константы
const DashboardCore = (function() {
    const API_BASE = window.location.origin + '/api';

    // Counter animation
    function animateCounter(element, targetValue, duration = 1000) {
        const start = parseInt(element.textContent) || 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (targetValue - start) * easeOut);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Spinner control
    function toggleSpinner(id, show) {
        const spinner = document.getElementById(id);
        if (spinner) {
            spinner.classList.toggle('d-none', !show);
        }
    }

    // Safe element getter
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    return {
        API_BASE,
        animateCounter,
        toggleSpinner,
        getElement
    };
})();