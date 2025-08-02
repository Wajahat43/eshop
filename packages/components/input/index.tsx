'use client';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface BaseInputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

interface TextInputProps extends BaseInputProps, React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'number' | 'email' | 'password';
}

interface TextareaProps extends BaseInputProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  type: 'textarea';
}

type InputProps = TextInputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>((props, ref) => {
  const { label, placeholder, type = 'text', error, className, ...restProps } = props;

  const inputClasses = twMerge(
    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'placeholder-gray-400 text-gray-900',
    error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
    className,
  );

  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';

  if (type === 'textarea') {
    const textareaProps = restProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>;
    return (
      <div className="w-full">
        {label && <label className={labelClasses}>{label}</label>}
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          placeholder={placeholder}
          className={inputClasses}
          {...textareaProps}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  const inputProps = restProps as React.InputHTMLAttributes<HTMLInputElement>;
  return (
    <div className="w-full">
      {label && <label className={labelClasses}>{label}</label>}
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        type={type}
        placeholder={placeholder}
        className={inputClasses}
        {...inputProps}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
