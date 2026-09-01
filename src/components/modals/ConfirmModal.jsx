import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from '../common/Button';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: '50%',
            background: tone === 'danger' ? 'var(--danger-soft)' : 'var(--warning-soft)',
            color: tone === 'danger' ? 'var(--danger)' : 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <AlertTriangle size={18} />
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, paddingTop: 6 }}>
          {message}
        </div>
      </div>
    </Modal>
  );
}
