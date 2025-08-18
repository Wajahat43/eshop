import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon: Icon, active = false, danger = false, onClick }) => {
  const baseClasses = 'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium';

  const variantClasses = danger
    ? 'text-destructive hover:bg-destructive/10 hover:text-destructive'
    : active
    ? 'bg-primary/10 text-primary border border-primary/20'
    : 'text-muted-foreground hover:bg-muted hover:text-foreground';

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      <Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
      {label}
    </button>
  );
};

export default NavItem;
