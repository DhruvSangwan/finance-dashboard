// =============================================================
// TOAST UTILITY (utils/toast.js)
// Lightweight toast notification system — no library needed.
// Shows a small popup in the bottom-right corner for 3 seconds.
//
// Usage anywhere in the app:
//   import toast from '../utils/toast';
//   toast.success('Expense added!');
//   toast.error('Something went wrong');
// =============================================================

const toast = {
  show(message, type = 'success') {
    const existing = document.getElementById('toast-notification');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'toast-notification';
    el.textContent = message;

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b',
    };

    Object.assign(el.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: colors[type] || colors.success,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '9999',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'toastIn 0.3s ease',
      maxWidth: '320px',
      lineHeight: '1.4',
    });

    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(10px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(el);

    setTimeout(() => {
      el.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  },

  success: (msg) => toast.show(msg, 'success'),
  error: (msg) => toast.show(msg, 'error'),
  info: (msg) => toast.show(msg, 'info'),
  warning: (msg) => toast.show(msg, 'warning'),
};

export default toast;
