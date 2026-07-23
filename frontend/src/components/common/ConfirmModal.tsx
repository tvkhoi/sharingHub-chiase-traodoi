import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Lock, Unlock, Trash2, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'emerald' | 'primary';
  icon?: 'lock' | 'unlock' | 'trash' | 'warning' | 'check';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'warning',
  icon = 'warning',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (icon) {
      case 'lock':
        return <Lock className="w-6 h-6 text-brand-rose" />;
      case 'unlock':
        return <Unlock className="w-6 h-6 text-brand-emerald" />;
      case 'trash':
        return <Trash2 className="w-6 h-6 text-brand-rose" />;
      case 'check':
        return <CheckCircle2 className="w-6 h-6 text-brand-emerald" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-brand-amber" />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'btn-danger';
      case 'emerald':
        return 'btn-emerald';
      case 'primary':
        return 'btn-primary';
      default:
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-color shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-card-hover flex items-center justify-center shrink-0 shadow-inner">
            {renderIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary leading-tight">{title}</h3>
            <p className="text-xs text-secondary mt-1">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-color">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-outline text-xs py-2 px-4"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn text-xs py-2 px-5 font-bold ${getButtonClass()}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
