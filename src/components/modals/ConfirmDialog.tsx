import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, Trash2, CheckCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  loading = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = `confirm-dialog-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `confirm-dialog-description-${Math.random().toString(36).substr(2, 9)}`;

  // Gestion du focus pour l'accessibilité
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Focus sur le dialogue lorsqu'il s'ouvre
      dialogRef.current.focus();
      
      // Empêcher le défilement du fond
      document.body.style.overflow = 'hidden';
      
      // Gérer la fermeture avec la touche Échap
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Tab') {
          // Gérer le focus à l'intérieur du dialogue
          if (e.shiftKey) {
            if (document.activeElement === closeButtonRef.current) {
              e.preventDefault();
              confirmButtonRef.current?.focus();
            }
          } else {
            if (document.activeElement === confirmButtonRef.current) {
              e.preventDefault();
              closeButtonRef.current?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    danger: <Trash2 className="h-12 w-12 text-red-500" aria-hidden="true" />,
    warning: <AlertTriangle className="h-12 w-12 text-yellow-500" aria-hidden="true" />,
    info: <CheckCircle className="h-12 w-12 text-emerald-500" aria-hidden="true" />,
  };

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-emerald-600 hover:bg-emerald-700',
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      tabIndex={-1}
      ref={dialogRef}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          aria-label="Fermer la boîte de dialogue"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4" aria-hidden="true">
            {icons[type]}
          </div>

          {/* Title */}
          <h3 id={titleId} className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h3>

          {/* Message */}
          <p id={descriptionId} className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-6 py-3 ${buttonColors[type]} text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2`}
              autoFocus
            >
              {loading && (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" 
                      aria-hidden="true" />
              )}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConfirmDialog);
