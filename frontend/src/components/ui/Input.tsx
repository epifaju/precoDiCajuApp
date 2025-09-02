import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    type = 'text',
    label,
    error,
    helpText,
    leftIcon,
    rightIcon,
    leftAddon,
    rightAddon,
    disabled,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const hasLeftElement = leftIcon || leftAddon;
    const hasRightElement = rightIcon || rightAddon;

    const inputClasses = cn(
      'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
      'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400',
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-500',
      hasLeftElement && 'pl-10',
      hasRightElement && 'pr-10',
      className
    );

    const iconClasses = 'absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center">
              <span className="bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-sm text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                {leftAddon}
              </span>
            </div>
          )}
          
          {leftIcon && !leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className={iconClasses}>{leftIcon}</span>
            </div>
          )}
          
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            disabled={disabled}
            style={{
              paddingLeft: leftAddon ? '80px' : hasLeftElement ? '2.5rem' : undefined,
              paddingRight: rightAddon ? '80px' : hasRightElement ? '2.5rem' : undefined,
            }}
            {...props}
          />
          
          {rightIcon && !rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className={iconClasses}>{rightIcon}</span>
            </div>
          )}
          
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              <span className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-sm text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                {rightAddon}
              </span>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };





