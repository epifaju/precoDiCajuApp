import React from 'react';
import { cn } from '../../utils/cn';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'onChange'> {
  label?: string;
  error?: string;
  helpText?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: React.ReactNode;
  loading?: boolean;
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className,
    label,
    error,
    helpText,
    options,
    placeholder,
    leftIcon,
    disabled,
    loading,
    onChange,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const hasLeftIcon = !!leftIcon;
    const isDisabled = disabled || loading;

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(event.target.value);
      }
    };

    const selectClasses = cn(
      'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'dark:bg-gray-900 dark:text-gray-100',
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-500',
      hasLeftIcon && 'pl-10',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="h-4 w-4 text-gray-500 dark:text-gray-400">{leftIcon}</span>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="animate-spin h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          
          <select
            className={selectClasses}
            ref={ref}
            disabled={isDisabled}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
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

Select.displayName = 'Select';

export { Select, type SelectOption };

