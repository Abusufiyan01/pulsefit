import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  open,
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmLabel = 'Confirm',
  confirmText,
  cancelLabel = 'Cancel',
  cancelText,
  danger = false,
  isDanger = false,
  loading = false,
  isLoading = false,
}) {
  const isShown = open ?? isOpen ?? false
  const bodyMessage = message ?? description
  const finalConfirmText = confirmText ?? confirmLabel
  const finalCancelText = cancelText ?? cancelLabel
  const isDestructive = danger || isDanger
  const busy = loading || isLoading

  return (
    <Modal open={isShown} onClose={onClose} size="sm">
      <div className="text-center space-y-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${isDestructive ? 'bg-red-500/15' : 'bg-primary-500/15'}`}>
          <AlertTriangle className={`w-7 h-7 ${isDestructive ? 'text-red-500' : 'text-primary-500'}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          {bodyMessage && <p className="text-muted text-sm mt-1">{bodyMessage}</p>}
        </div>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="secondary" fullWidth disabled={busy}>
            {finalCancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={isDestructive ? 'danger' : 'primary'}
            fullWidth
            loading={busy}
          >
            {finalConfirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export { ConfirmDialog }
