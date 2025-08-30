import { useTranslation } from 'react-i18next';
import { Heart, Globe } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="ml-3 text-lg font-bold text-gray-900 dark:text-white">
                Preço di Cajú
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Plataforma colaborativa para acompanhar os preços do cajú na Guiné-Bissau.
              Dados em tempo real para produtores, comerciantes e cooperativas.
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Globe className="w-4 h-4 mr-1" />
              <span>Guiné-Bissau</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {t('nav.home')}
                </a>
              </li>
              <li>
                <a href="/prices" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {t('nav.prices')}
                </a>
              </li>
              <li>
                <a href="/submit" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {t('nav.submit')}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Suporte
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Como usar
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Privacidade
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>© 2024 Preço di Cajú. Feito com</span>
              <Heart className="w-4 h-4 mx-1 text-red-500" />
              <span>para a Guiné-Bissau</span>
            </div>
            
            <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
              <span>Versão 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


