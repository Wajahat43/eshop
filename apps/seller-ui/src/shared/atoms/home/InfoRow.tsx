import React from 'react';

type InfoRowProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value, className }) => {
  return (
    <div className={`flex items-center justify-between text-sm ${className || ''}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
};

export default InfoRow;
