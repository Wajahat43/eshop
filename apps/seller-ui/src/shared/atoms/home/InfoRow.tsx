import React from 'react';

type InfoRowProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value, className }) => {
  return (
    <div className={`flex items-center justify-between gap-3 text-sm ${className || ''} overflow-wrap max-w-[100%]`}>
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
};

export default InfoRow;
