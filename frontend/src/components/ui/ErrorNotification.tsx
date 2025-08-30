import React from 'react';
import { X, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface ErrorNotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  onClose?: () => void;
  show?: boolean;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-400" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-400" />;
    default:
      return <Info className="w-5 h-5 text-blue-400" />;
  }
};

const getStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800';
  }
};

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  type,
  title,
  message,
  onClose,
  show = true
}) => {
  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getStyles(type)} border rounded-lg shadow-lg`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon(type)}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-1 text-sm">{message}</p>
          </div>
          {onClose && (
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={onClose}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;
