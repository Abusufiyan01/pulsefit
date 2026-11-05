import toast from 'react-hot-toast'

export const showToast = {
  success: (msg, options = {}) =>
    toast.success(msg, {
      iconTheme: { primary: '#FF5A1F', secondary: '#FFFFFF' },
      ...options,
    }),
  error: (msg, options = {}) =>
    toast.error(msg, {
      ...options,
    }),
  loading: (msg, options = {}) =>
    toast.loading(msg, {
      ...options,
    }),
  dismiss: (toastId) => toast.dismiss(toastId),
}

export default showToast
