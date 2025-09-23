/**
 * Utility functions for safe i18n translation rendering in React
 */

import { TFunction } from 'i18next';

/**
 * Safe translation function that ensures a string is returned for React rendering
 * Prevents "Objects are not valid as a React child" errors
 * 
 * @param t - The translation function from useTranslation
 * @param key - The translation key
 * @param defaultValue - Fallback value if translation is missing
 * @param options - Translation options (interpolation, etc.)
 * @returns A string safe for React rendering
 */
export function safeT(
  t: TFunction, 
  key: string, 
  defaultValue?: string,
  options?: any
): string {
  try {
    const result = t(key, defaultValue, options);
    
    // If result is an object, return the default value or a safe fallback
    if (typeof result === 'object' && result !== null) {
      console.warn(`Translation key "${key}" returned an object instead of a string:`, result);
      return defaultValue || `[Missing translation: ${key}]`;
    }
    
    // If result is undefined, null, or not a string, return default
    if (typeof result !== 'string') {
      console.warn(`Translation key "${key}" did not return a string:`, typeof result, result);
      return defaultValue || `[Missing translation: ${key}]`;
    }
    
    return result;
  } catch (error) {
    console.error(`Error getting translation for key "${key}":`, error);
    return defaultValue || `[Translation error: ${key}]`;
  }
}

/**
 * Type guard to check if a value is safe for React rendering
 * 
 * @param value - The value to check
 * @returns True if the value is safe for React rendering
 */
export function isSafeForReactRender(value: unknown): value is string | number | boolean | null | undefined {
  const type = typeof value;
  return (
    type === 'string' ||
    type === 'number' ||
    type === 'boolean' ||
    value === null ||
    value === undefined
  );
}

/**
 * Safely renders any value for React, converting objects to strings if needed
 * 
 * @param value - The value to render
 * @returns A value safe for React rendering
 */
export function safeRender(value: unknown): string | number | boolean | null | undefined {
  if (isSafeForReactRender(value)) {
    return value;
  }
  
  // For objects, arrays, etc., convert to JSON string
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return `[Object: ${Object.prototype.toString.call(value)}]`;
    }
  }
  
  // For functions, symbols, etc.
  return `[${typeof value}]`;
}

/**
 * Hook-like function to create a safe translation function
 * Use this instead of direct useTranslation when you need guaranteed string returns
 * 
 * @param t - The translation function from useTranslation
 * @returns A safe translation function
 */
export function createSafeTranslation(t: TFunction) {
  return (key: string, defaultValue?: string, options?: any) => 
    safeT(t, key, defaultValue, options);
}


