import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface FileUploadProps {
  label?: string;
  error?: string;
  helpText?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  value?: File[];
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  helpText,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  onFilesChange,
  value = [],
  className,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (onFilesChange) {
      onFilesChange(acceptedFiles);
    }
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (index: number) => {
    if (onFilesChange) {
      const newFiles = value.filter((_, i) => i !== index);
      onFilesChange(newFiles);
    }
  };

  const hasError = !!error || fileRejections.length > 0;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          'hover:bg-gray-50 dark:hover:bg-gray-800',
          disabled && 'cursor-not-allowed opacity-50',
          isDragActive && 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
          hasError
            ? 'border-red-300 dark:border-red-700'
            : 'border-gray-300 dark:border-gray-600',
          !isDragActive && !hasError && 'hover:border-gray-400 dark:hover:border-gray-500'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400">Drop files here...</p>
            ) : (
              <div>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Click to upload
                </span>{' '}
                or drag and drop
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {Object.keys(accept).join(', ')} up to {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map((file, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="mt-2">
          {fileRejections.map(({ file, errors }, index) => (
            <div key={index} className="text-sm text-red-600 dark:text-red-400">
              {file.name}: {errors.map(e => e.message).join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
};




