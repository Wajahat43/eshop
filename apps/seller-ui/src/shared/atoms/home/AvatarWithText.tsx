import React from 'react';

type AvatarWithTextProps = {
  src?: string | null;
  fallback: string;
  title: string;
  subtitle?: string;
  className?: string;
};

const AvatarWithText: React.FC<AvatarWithTextProps> = ({ src, fallback, title, subtitle, className }) => {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div className="h-12 w-12 rounded-full bg-muted overflow-hidden grid place-items-center text-sm font-medium">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
      <div>
        <div className="text-sm font-semibold leading-none">{title}</div>
        {subtitle ? <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div> : null}
      </div>
    </div>
  );
};

export default AvatarWithText;
