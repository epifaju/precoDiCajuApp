import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  pt: { translation: pt },
  fr: { translation: fr },
  en: { translation: en },
};

// Initialize i18n
const initI18n = async () => {
  // Get user preferred language from auth store if available
  const getInitialLanguage = () => {
    try {
      // Check if user is logged in and has preferred language
      const authStorage = localStorage.getItem('precaju-auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        if (authData.state?.user?.preferredLanguage) {
          return authData.state.user.preferredLanguage;
        }
      }
      
      // Fallback to localStorage
      const storedLanguage = localStorage.getItem('precaju-language');
      if (storedLanguage && ['pt', 'fr', 'en'].includes(storedLanguage)) {
        return storedLanguage;
      }
      
      // Fallback to browser language
      const browserLang = navigator.language.split('-')[0];
      if (['pt', 'fr', 'en'].includes(browserLang)) {
        return browserLang;
      }
      
      // Default to Portuguese
      return 'pt';
    } catch (error) {
      console.warn('Error getting initial language:', error);
      return 'pt';
    }
  };

  const initialLanguage = getInitialLanguage();

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'pt',
      lng: initialLanguage,
      debug: import.meta.env.DEV,
      
      interpolation: {
        escapeValue: false, // React already does escaping
      },

      // Disable returnObjects to ensure strings are returned for React rendering
      returnObjects: false,

      detection: {
        // Custom detection order: user preference > localStorage > navigator
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },

      react: {
        useSuspense: false,
      },
    });

  // Language is now set based on user preference or fallbacks
};

// Initialize immediately
initI18n().catch(console.error);

export default i18n;

