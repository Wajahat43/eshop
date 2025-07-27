import React from 'react';
import GoogleIcon from '../../assets/svgs/GoogleIcon';
import { twMerge } from 'tailwind-merge';

interface GoogleButtonProps {
  onClick: () => void;
  className: string;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick, className, ...props }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
      }}
      className={twMerge('border border-border', className)}
      {...props}
    >
      <GoogleIcon style={{ width: '24px', height: '24px', marginRight: '10px' }} />
      Sign in with Google
    </button>
  );
};

export default GoogleButton;
