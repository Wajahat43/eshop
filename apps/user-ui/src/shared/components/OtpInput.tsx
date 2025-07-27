import React, { useRef, useState, useEffect } from 'react';

interface OtpInputProps {
  length: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  canResend?: boolean;
  resendTimer?: number;
  isLoading?: boolean;
  error?: string | null;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length,
  onComplete,
  onResend,
  canResend = false,
  resendTimer = 0,
  isLoading,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(resendTimer);
  const [isResending, setIsResending] = useState(false);
  const [isOtpFilled, setIsOtpFilled] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      setTimer(resendTimer);
      setIsResending(true);
    }
  }, [resendTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isResending && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResending(false);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResending, timer]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    // Allow only single digit numbers
    if (value && isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value[0] || ''; // Take only the first character

    setOtp(newOtp);

    // If a digit was entered, move focus to the next input
    if (newOtp[index] && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all digits are entered, set isOtpFilled to true
    if (newOtp.every((digit) => digit !== '')) {
      setIsOtpFilled(true);
    } else {
      setIsOtpFilled(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      // If backspace is pressed and current input is empty, move focus to previous
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index] && index > 0) {
        // If backspace is pressed and current input has a value, clear it and move focus to previous
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleResendClick = () => {
    if (onResend) {
      onResend();
      setTimer(resendTimer); // Reset timer
      setIsResending(true);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            className="w-12 h-12 text-center text-xl text-foreground dark:text-black bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ))}
      </div>
      {canResend && (
        <button
          onClick={handleResendClick}
          disabled={isResending && timer > 0}
          className={`mt-4 px-4 py-2 rounded-md ${
            isResending && timer > 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/80'
          }`}
        >
          {isResending && timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
        </button>
      )}
      <button
        onClick={() => onComplete(otp.join(''))}
        disabled={!isOtpFilled || isLoading}
        className={`mt-4 px-4 py-2 rounded-md ${
          !isOtpFilled
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/80'
        }`}
      >
        {isLoading ? 'Verifying...' : isOtpFilled ? 'Verify OTP' : 'Enter OTP'}
      </button>

      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </div>
  );
};

export default OtpInput;
