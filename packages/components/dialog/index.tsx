import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
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

  console.log('Dialog rendered');

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
      case '2xl':
        return 'max-w-2xl';
      case '3xl':
        return 'max-w-3xl';
      case '4xl':
        return 'max-w-4xl';
      case '5xl':
        return 'max-w-5xl';
      case '6xl':
        return 'max-w-6xl';
      case '7xl':
        return 'max-w-7xl';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div
        className={`bg-card border border-border rounded-lg p-6 w-full ${getSizeClasses()} max-h-[80vh] overflow-y-auto shadow-lg`}
      >
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
