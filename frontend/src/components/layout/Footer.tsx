import { useTranslation } from 'react-i18next';
import { Heart, Globe, MapPin, Mail, Phone, Shield, FileText, HelpCircle, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - Enhanced Mobile Responsiveness */}
        <div className="space-y-8 sm:space-y-12">
          {/* Mobile Layout */}
          <div className="block lg:hidden">
            <div className="space-y-8">
              {/* Brand Section - Mobile Enhanced */}
              <div className="footer-brand-card text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">PC</span>
                  </div>
                  <span className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Preço di Cajú
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6 max-w-md mx-auto sm:mx-0">
                  {t('footer.brand.description', 'Plateforme collaborative pour suivre les prix du cajou en Guinée-Bissau. Données en temps réel pour producteurs, commerçants et coopératives.')}
                </p>
                <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="font-medium">{t('footer.brand.location', 'Guinée-Bissau')}</span>
                </div>
              </div>

              {/* Quick Links Section - Mobile Enhanced */}
              <div className="footer-links-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center justify-center sm:justify-start">
                  <ExternalLink className="footer-icon w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                  {t('footer.quickLinks', 'Liens Rapides')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a 
                    href="/" 
                    className="footer-link flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 group p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:bg-green-600 transition-colors duration-200"></span>
                    {t('nav.home', 'Accueil')}
                  </a>
                  <a 
                    href="/prices" 
                    className="footer-link flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 group p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:bg-green-600 transition-colors duration-200"></span>
                    {t('nav.prices', 'Prix')}
                  </a>
                  <a 
                    href="/submit" 
                    className="footer-link flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 group p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:bg-green-600 transition-colors duration-200"></span>
                    {t('nav.submit', 'Soumettre')}
                  </a>
                </div>
              </div>

              {/* Support Section - Mobile Enhanced */}
              <div className="footer-support-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center justify-center sm:justify-start">
                  <HelpCircle className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                  {t('footer.support', 'Support')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a 
                    href="#" 
                    className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-200"></span>
                    {t('footer.howToUse', 'Comment utiliser')}
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-200"></span>
                    {t('footer.faq', 'FAQ')}
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-200"></span>
                    {t('footer.contact', 'Contact')}
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-200"></span>
                    {t('footer.privacy', 'Confidentialité')}
                  </a>
                </div>
              </div>

              {/* Contact & Legal Section - Mobile Enhanced */}
              <div className="footer-contact-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center justify-center sm:justify-start">
                  <Shield className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                  {t('footer.legal', 'Legal & Contacto')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
                    <Mail className="w-5 h-5 mr-3 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-sm font-medium">contact@precodicaju.gw</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
                    <Phone className="w-5 h-5 mr-3 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-sm font-medium">+245 XXX XXX XXX</span>
                  </div>
                  <div className="pt-2">
                    <a 
                      href="#" 
                      className="inline-flex items-center justify-center sm:justify-start text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 w-full sm:w-auto"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {t('footer.terms', 'Termos de Serviço')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Brand Section - Desktop */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">PC</span>
                  </div>
                  <span className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Preço di Cajú
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6 max-w-sm">
                  {t('footer.brand.description', 'Plateforme collaborative pour suivre les prix du cajou en Guinée-Bissau. Données en temps réel pour producteurs, commerçants et coopératives.')}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="font-medium">{t('footer.brand.location', 'Guinée-Bissau')}</span>
                </div>
              </div>

              {/* Quick Links Section - Desktop */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                  {t('footer.quickLinks', 'Liens Rapides')}
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="/" 
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 group"
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:bg-green-600 transition-colors duration-200"></span>
                      {t('nav.home', 'Accueil')}
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/prices" 
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 group"
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:bg-green-600 transition-colors duration-200"></span>
                      {t('nav.prices', 'Prix')}
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/submit" 
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 group"
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:bg-green-600 transition-colors duration-200"></span>
                      {t('nav.submit', 'Soumettre')}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support Section - Desktop */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                  {t('footer.support', 'Support')}
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="#" 
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-200"></span>
                      {t('footer.howToUse', 'Comment utiliser')}
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-200"></span>
                      {t('footer.faq', 'FAQ')}
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-200"></span>
                      {t('footer.contact', 'Contact')}
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-200"></span>
                      {t('footer.privacy', 'Confidentialité')}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact & Legal Section - Desktop */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                  {t('footer.legal', 'Legal & Contacto')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Mail className="w-5 h-5 mr-3 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-sm font-medium">contact@precodicaju.gw</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Phone className="w-5 h-5 mr-3 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-sm font-medium">+245 XXX XXX XXX</span>
                  </div>
                  <div className="pt-2">
                    <a 
                      href="#" 
                      className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {t('footer.terms', 'Termos de Serviço')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer - Enhanced Mobile Design */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright Section */}
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{t('footer.copyright', '© 2024 Preço di Cajú')}</span>
                <Heart className="w-4 h-4 mx-2 text-red-500 animate-pulse" />
                <span className="font-medium">{t('footer.forGuineaBissau', 'pour la Guinée-Bissau')}</span>
              </div>
            </div>
            
            {/* Version & Language Info */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <span>{t('footer.version', 'v1.0.0')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {t('footer.status', 'En ligne')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


