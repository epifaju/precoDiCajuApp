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
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'pt',
      lng: 'pt', // Force Portuguese as default
      debug: import.meta.env.DEV,
      
      interpolation: {
        escapeValue: false, // React already does escaping
      },

      detection: {
        // Simple detection order
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },

      react: {
        useSuspense: false,
      },
    });

  // Force Portuguese language after initialization
  if (i18n.language !== 'pt') {
    await i18n.changeLanguage('pt');
  }
  
  // Clear any cached language that isn't Portuguese
  const storedLang = localStorage.getItem('i18nextLng');
  if (storedLang && storedLang !== 'pt') {
    localStorage.setItem('i18nextLng', 'pt');
    await i18n.changeLanguage('pt');
  }
};

// Initialize immediately
initI18n().catch(console.error);

export default i18n;

