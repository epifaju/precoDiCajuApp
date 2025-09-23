/**
 * Safe text rendering component
 * Prevents "Objects are not valid as a React child" errors
 */

import React from 'react';
import { safeRender } from '../../utils/safeTranslation';
import { ReactSafeContent } from '../../types/react-safe';

interface SafeTextProps {
  children: unknown; // Accept any type but render safely
  className?: string;
  fallback?: string;
  as?: keyof JSX.IntrinsicElements; // Allow different HTML elements
}

/**
 * SafeText component that ensures content is safe for React rendering
 * Automatically converts objects to JSON strings and handles other unsafe types
 */
export const SafeText: React.FC<SafeTextProps> = ({ 
  children, 
  className = '', 
  fallback = '[Content Error]',
  as: Component = 'span'
}) => {
  const safeContent = React.useMemo(() => {
    try {
      const rendered = safeRender(children);
      
      // If safeRender returns a valid React-safe value, use it
      if (rendered !== null && rendered !== undefined) {
        return rendered;
      }
      
      return fallback;
    } catch (error) {
      console.error('SafeText render error:', error);
      return fallback;
    }
  }, [children, fallback]);

  return <Component className={className}>{safeContent}</Component>;
};

/**
 * SafeTranslationText specifically for i18n content
 * Use this when you're unsure if a translation might return an object
 */
interface SafeTranslationTextProps {
  translationResult: unknown;
  fallback?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const SafeTranslationText: React.FC<SafeTranslationTextProps> = ({
  translationResult,
  fallback = '[Missing Translation]',
  className = '',
  as: Component = 'span'
}) => {
  const safeContent = React.useMemo(() => {
    // If it's already a string, use it directly
    if (typeof translationResult === 'string') {
      return translationResult;
    }
    
    // If it's an object with the expected translation keys, extract them
    if (typeof translationResult === 'object' && translationResult !== null) {
      const obj = translationResult as any;
      
      // Look for common translation properties
      if (obj.error_title) return obj.error_title;
      if (obj.title) return obj.title;
      if (obj.message) return obj.message;
      if (obj.text) return obj.text;
      
      // If it's a translation object with multiple keys, warn and use fallback
      console.warn('Translation returned object instead of string:', translationResult);
      return fallback;
    }
    
    // For other types, use safeRender
    return safeRender(translationResult) || fallback;
  }, [translationResult, fallback]);

  return <Component className={className}>{safeContent}</Component>;
};

export default SafeText;


