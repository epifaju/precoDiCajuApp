import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Calendar, Star, Settings } from 'lucide-react';

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('profile.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  João Produtor
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Contribuidor
                </p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Reputação: 85 pontos
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white">produtor@test.gw</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Telefone</p>
                    <p className="text-gray-900 dark:text-white">+245 123 456 789</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Membro desde</p>
                    <p className="text-gray-900 dark:text-white">Janeiro 2024</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Settings className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Último acesso</p>
                    <p className="text-gray-900 dark:text-white">Hoje às 14:30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('profile.preferences.title')}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="label">
                  {t('profile.preferences.language')}
                </label>
                <select className="input">
                  <option value="pt">Português</option>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="label">
                  {t('profile.preferences.regions')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['Bafatá', 'Gabú', 'Bissau', 'Cacheu', 'Quinara', 'Tombali'].map((region) => (
                    <label key={region} className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        defaultChecked={['Bafatá', 'Gabú'].includes(region)}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {region}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  {t('profile.preferences.theme')}
                </label>
                <select className="input">
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="btn btn-primary">
                Guardar alterações
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('profile.stats.pricesSubmitted')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-semibold text-gray-900 dark:text-white">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Verificados</span>
                <span className="font-semibold text-green-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pendentes</span>
                <span className="font-semibold text-yellow-600">4</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Regiões Activas
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bafatá</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">7 preços</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gabú</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">5 preços</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acções Rápidas
            </h3>
            <div className="space-y-2">
              <button className="btn btn-outline w-full text-sm">
                Editar perfil
              </button>
              <button className="btn btn-outline w-full text-sm">
                Alterar palavra-passe
              </button>
              <button className="btn btn-outline w-full text-sm text-red-600 border-red-200 hover:bg-red-50">
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


