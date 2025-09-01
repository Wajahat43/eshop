import React from 'react';

type Status = 'success' | 'warning' | 'error' | 'info' | 'default';

const statusToClasses: Record<Status, string> = {
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20',
  error: 'bg-red-500/10 text-red-700 dark:text-red-300 ring-1 ring-red-500/20',
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20',
  default: 'bg-secondary text-secondary-foreground',
};

type StatusBadgeProps = {
  label: string;
  status?: Status;
  className?: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, status = 'default', className }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusToClasses[status]} ${
        className || ''
      }`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
