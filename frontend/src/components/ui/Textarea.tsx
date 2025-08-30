import React from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className,
    label,
    error,
    helpText,
    disabled,
    ...props 
  }, ref) => {
    const hasError = !!error;

    const textareaClasses = cn(
      'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm',
      'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400',
      'resize-y',
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-500',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <textarea
          className={textareaClasses}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        
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

Textarea.displayName = 'Textarea';

export { Textarea };


