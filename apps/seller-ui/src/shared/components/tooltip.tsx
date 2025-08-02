import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactElement;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const showTooltip = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = rect.top;

    switch (position) {
      case 'top':
        y = rect.top - 10;
        break;
      case 'bottom':
        y = rect.bottom + 10;
        break;
      case 'left':
        x = rect.left - 10;
        y = rect.top + rect.height / 2;
        break;
      case 'right':
        x = rect.right + 10;
        y = rect.top + rect.height / 2;
        break;
    }

    setTooltipPosition({ x, y });
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'transform -translate-x-1/2 -translate-y-full';
      case 'bottom':
        return 'transform -translate-x-1/2 translate-y-full';
      case 'left':
        return 'transform -translate-x-full -translate-y-1/2';
      case 'right':
        return 'transform translate-x-full -translate-y-1/2';
      default:
        return 'transform -translate-x-1/2 -translate-y-full';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {React.cloneElement(children, {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
      } as React.HTMLAttributes<HTMLElement>)}

      {isVisible && (
        <div
          className={`fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none ${getPositionClasses()}`}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          {content}
          <div className={`absolute w-0 h-0 ${getArrowClasses()}`} />
        </div>
      )}
    </div>
  );
};
