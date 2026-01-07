import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './Snackbar.css';

export type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarProps {
    message: string;
    type: SnackbarType;
    isOpen: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Snackbar({ message, type, isOpen, onClose, duration = 3000 }: SnackbarProps) {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const icons = {
        success: <CheckCircle size={20} />,
        error: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    return (
        <div className={`snackbar snackbar-${type} slide-in`}>
            <div className="snackbar-icon">{icons[type]}</div>
            <span className="snackbar-message">{message}</span>
            <button onClick={onClose} className="snackbar-close">
                <X size={16} />
            </button>
        </div>
    );
}
