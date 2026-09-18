import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Button from './Button';
import './ConfirmModal.css';

export default function ConfirmModal({
  isOpen,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName = '',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel?.();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-backdrop" onClick={loading ? undefined : onCancel}>
      <div
        className="confirm-modal-box animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="confirm-modal-icon-wrap">
          <AlertTriangle size={28} className="confirm-modal-icon" />
        </div>

        <h3 id="confirm-modal-title" className="confirm-modal-title">
          {title}
        </h3>

        <p className="confirm-modal-message">
          {message}
        </p>

        {itemName && (
          <div className="confirm-modal-item-highlight">
            &ldquo;{itemName}&rdquo;
          </div>
        )}

        <div className="confirm-modal-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
            className={danger ? 'btn--danger-action' : ''}
          >
            {loading ? 'Deleting...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
