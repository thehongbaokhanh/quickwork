import { ref } from 'vue';
const toasts = ref([]);
export const useToast = () => {
    const addToast = (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id, duration: toast.duration || 3000 };
        toasts.value.push(newToast);
        if (newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, newToast.duration);
        }
    };
    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id);
        if (index > -1) {
            toasts.value.splice(index, 1);
        }
    };
    const success = (title, message) => addToast({ title, message, type: 'success' });
    const error = (title, message) => addToast({ title, message, type: 'error' });
    const info = (title, message) => addToast({ title, message, type: 'info' });
    const warning = (title, message) => addToast({ title, message, type: 'warning' });
    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning
    };
};
