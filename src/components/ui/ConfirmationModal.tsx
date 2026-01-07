
import { X, AlertTriangle } from 'lucide-react';
import '../../pages/Admin.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title-wrapper">
                        {type === 'danger' && <AlertTriangle className="text-red-500" size={24} style={{ color: 'var(--color-danger, #ef4444)' }} />}
                        <h3>{title}</h3>
                    </div>
                    <button onClick={onClose} className="icon-btn"><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="secondary-btn">{cancelText}</button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`primary-btn ${type === 'danger' ? 'danger-btn' : ''}`}
                        style={type === 'danger' ? { background: 'var(--color-danger, #ef4444)' } : {}}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
