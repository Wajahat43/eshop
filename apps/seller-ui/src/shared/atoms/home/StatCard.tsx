import React from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, className }) => {
  return (
    <div
      className={`rounded-lg border border-border bg-card text-card-foreground shadow p-4 md:p-5 ${className || ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">{value}</h3>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {icon ? <div className="shrink-0 text-foreground/80">{icon}</div> : null}
      </div>
    </div>
  );
};

export default StatCard;
