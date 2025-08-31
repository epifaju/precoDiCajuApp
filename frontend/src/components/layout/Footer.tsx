import { useTranslation } from 'react-i18next';
import { Heart, Globe, MapPin, Mail, Phone, Shield, FileText, HelpCircle, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section - Full width on mobile, spans 2 columns on larger screens */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">PC</span>
              </div>
              <span className="ml-4 text-xl font-bold text-gray-900 dark:text-white">
                Preço di Cajú
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6 max-w-sm">
              {t('footer.brand.description')}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3">
              <MapPin className="w-4 h-4 mr-3 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <span className="font-medium">{t('footer.brand.location')}</span>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <ExternalLink className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-600 transition-colors duration-200"></span>
                  {t('nav.home')}
                </a>
              </li>
              <li>
                <a 
                  href="/prices" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-600 transition-colors duration-200"></span>
                  {t('nav.prices')}
                </a>
              </li>
              <li>
                <a 
                  href="/submit" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                >
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 group-hover:bg-primary-600 transition-colors duration-200"></span>
                  {t('nav.submit')}
                </a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <HelpCircle className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
              {t('footer.support')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                >
                  <span className="w-2 h-2 bg-accent-400 rounded-full mr-3 group-hover:bg-accent-600 transition-colors duration-200"></span>
                  {t('footer.howToUse')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                >
                  <span className="w-2 h-2 bg-accent-400 rounded-full mr-3 group-hover:bg-accent-600 transition-colors duration-200"></span>
                  {t('footer.faq')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                >
                  <span className="w-2 h-2 bg-accent-400 rounded-full mr-3 group-hover:bg-accent-600 transition-colors duration-200"></span>
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                >
                  <span className="w-2 h-2 bg-accent-400 rounded-full mr-3 group-hover:bg-accent-600 transition-colors duration-200"></span>
                  {t('footer.privacy')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Legal Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
              {t('footer.legal', 'Legal & Contact')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="text-sm">contact@precodicaju.gw</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="text-sm">+245 XXX XXX XXX</span>
              </div>
              <div className="pt-2">
                <a 
                  href="#" 
                  className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t('footer.terms', 'Terms of Service')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright Section */}
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{t('footer.copyright')}</span>
                <Heart className="w-4 h-4 mx-2 text-red-500 animate-pulse" />
                <span className="font-medium">{t('footer.forGuineaBissau')}</span>
              </div>
            </div>
            
            {/* Version & Language Info */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <span>{t('footer.version')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {t('footer.status', 'Online')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


