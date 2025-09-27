import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { Menu, X, Globe, Sun, Moon } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { cn } from '../../utils/cn';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme, setLanguage } = useAppStore();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: t('nav.home'), href: '/', current: location.pathname === '/' },
    { name: t('nav.dashboard'), href: '/dashboard', current: location.pathname === '/dashboard' },
    { name: t('nav.prices'), href: '/prices', current: location.pathname === '/prices' },
    { name: t('nav.poi'), href: '/poi', current: location.pathname === '/poi' },
    { name: t('nav.submit'), href: '/submit', current: location.pathname === '/submit' },
    { name: t('nav.exporters', 'Exportateurs'), href: '/exporters', current: location.pathname === '/exporters' },
    // Lien d'administration pour les admins
    ...(user?.role === 'ADMIN' ? [{ name: t('nav.admin', 'Administration'), href: '/admin', current: location.pathname === '/admin' }] : []),
  ];

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Also update the app store language
    setLanguage(lng as 'pt' | 'fr' | 'en');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Preço di Cajú
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  item.current
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-300"
              >
                <option value="pt">PT</option>
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
              <Globe className="absolute right-1 top-1 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label={t('nav.menu')}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 mobile-menu-enter">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'block px-3 py-2 text-base font-medium rounded-md transition-colors',
                    item.current
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Idioma / Language
                </span>
                <select
                  value={i18n.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-700 dark:text-gray-300"
                >
                  <option value="pt">Português</option>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Tema / Theme
                </span>
                <button
                  onClick={toggleTheme}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="mt-4 space-y-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('user.welcome', 'Bienvenue')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('user.connected', 'Connecté')}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="block btn btn-outline w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('user.profile', 'Mon profil')}
                  </Link>
                  <button
                    onClick={() => {
                      useAuthStore.getState().logout();
                      setIsMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="block btn btn-outline w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {t('user.logout', 'Se déconnecter')}
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block btn btn-outline w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="block btn btn-primary w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
