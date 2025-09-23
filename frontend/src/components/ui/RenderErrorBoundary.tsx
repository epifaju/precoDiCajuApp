/**
 * Error Boundary specifically for handling React render errors
 * Catches "Objects are not valid as a React child" and similar errors
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class RenderErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RenderErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({ errorInfo });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // Log specific information for React child errors
    if (error.message.includes('Objects are not valid as a React child')) {
      console.error('React child error detected! This usually means an object was passed directly to JSX.');
      console.error('Check for:', {
        'Translation objects': 'useTranslation hooks returning objects instead of strings',
        'API responses': 'Raw API response objects being rendered',
        'State objects': 'Complex state objects passed to JSX',
        'Props': 'Object props being rendered directly'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Render Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Something went wrong while rendering this component.
                  {this.state.error?.message.includes('Objects are not valid as a React child') && (
                    <span className="block mt-1 font-medium">
                      This usually means an object was passed where text was expected.
                    </span>
                  )}
                </p>
                
                {this.props.showErrorDetails && this.state.error && (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium">
                      Error Details
                    </summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {this.state.error.message}
                      {this.state.errorInfo && (
                        <>
                          {'\n\nComponent Stack:'}
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </details>
                )}
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with render error boundary
 */
export function withRenderErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <RenderErrorBoundary fallback={fallback}>
        <Component {...props} />
      </RenderErrorBoundary>
    );
  };
}

export default RenderErrorBoundary;


