import React from 'react';

type SectionHeaderProps = {
  title: string;
  action?: React.ReactNode;
  description?: string;
  className?: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, description, className }) => {
  return (
    <div className={`flex items-start justify-between gap-3 ${className || ''}`}>
      <div>
        <h2 className="text-base md:text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};

export default SectionHeader;
