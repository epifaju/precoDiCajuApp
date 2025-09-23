/**
 * TypeScript types for safe React rendering
 * Prevents "Objects are not valid as a React child" errors
 */

import { ReactNode } from 'react';

/**
 * Primitive types that are safe for React rendering
 */
export type ReactSafePrimitive = string | number | boolean | null | undefined;

/**
 * Content that is safe for React rendering
 * Excludes objects, arrays, functions, etc. that would cause React errors
 */
export type ReactSafeContent = ReactSafePrimitive | ReactNode;

/**
 * Props interface for components that display text content
 * Ensures the content is safe for React rendering
 */
export interface SafeTextProps {
  children: ReactSafeContent;
  className?: string;
}

/**
 * Props interface for components that might receive translation objects
 * Use this to catch translation misuse at compile time
 */
export interface SafeTranslationProps {
  text: string; // Force explicit string type
  fallback?: string;
}

/**
 * Type guard to ensure content is safe for React rendering
 */
export function isReactSafeContent(value: unknown): value is ReactSafeContent {
  if (value === null || value === undefined) {
    return true;
  }
  
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }
  
  // React elements and fragments are safe
  if (typeof value === 'object' && value !== null) {
    // Check if it's a React element (has $$typeof symbol)
    const reactElement = value as any;
    if (reactElement.$$typeof) {
      return true;
    }
  }
  
  return false;
}

/**
 * Utility type to extract string values from translation objects
 * Use this for type-safe translation key access
 */
export type TranslationKeyValue<T> = T extends string ? T : never;

/**
 * Error boundary props for handling render errors
 */
export interface RenderErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}


