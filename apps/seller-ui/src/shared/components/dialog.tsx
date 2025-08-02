import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      default:
        return 'max-w-md';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className={`bg-card border border-border rounded-lg p-6 w-full ${getSizeClasses()} shadow-lg`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          {showCloseButton && (
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
