import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Calendar, Star, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { EditProfileFormWorking } from '../components/profile/EditProfileFormWorking';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  
  // État pour les préférences
  const [preferences, setPreferences] = useState({
    language: 'pt',
    regions: [] as string[],
    theme: 'system'
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesMessage, setPreferencesMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Debug: Log current language and translation
  console.log('ProfilePage - Current language:', i18n.language);
  console.log('ProfilePage - Translation test:', t('profile.actions.editProfile'));

  // Initialiser les préférences avec les données de l'utilisateur
  useEffect(() => {
    if (user) {
      setPreferences({
        language: i18n.language || 'pt',
        regions: user.preferredRegions || [],
        theme: 'system'
      });
    }
  }, [user, i18n.language]);

  // Fonction pour sauvegarder les préférences
  const handleSavePreferences = async () => {
    if (!user) return;
    
    setIsSavingPreferences(true);
    setPreferencesMessage(null);
    
    try {
      // Simuler la sauvegarde des préférences
      // Ici vous pourriez appeler une API pour sauvegarder les préférences
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour la langue si elle a changé
      if (preferences.language !== i18n.language) {
        i18n.changeLanguage(preferences.language);
      }
      
      setPreferencesMessage({
        type: 'success',
        text: 'Preferências salvas com sucesso!'
      });
      
      // Effacer le message après 3 secondes
      setTimeout(() => setPreferencesMessage(null), 3000);
      
    } catch (error) {
      setPreferencesMessage({
        type: 'error',
        text: 'Erro ao salvar preferências. Tente novamente.'
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  // Format last login date
  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Agora mesmo';
      if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
      if (diffInHours < 48) return 'Ontem';
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'MODERATOR':
        return 'Moderador';
      case 'CONTRIBUTOR':
        return 'Contribuidor';
      default:
        return role;
    }
  };

  const editProfileText = t('profile.actions.editProfile');

  // Debug: Log the translation values
  console.log('Edit Profile Text:', editProfileText);
  console.log('Raw translation key:', 'profile.actions.editProfile');
  console.log('Translation function result:', t('profile.actions.editProfile'));

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
                  {user.fullName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {getRoleLabel(user.role)}
                </p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Reputação: {user.reputationScore} pontos
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
                    <p className="text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Telefone</p>
                    <p className="text-gray-900 dark:text-white">
                      {user.phone || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Membro desde</p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Settings className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Último acesso</p>
                    <p className="text-gray-900 dark:text-white">
                      {formatLastLogin(user.lastLoginAt)}
                    </p>
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
              {/* Message de feedback */}
              {preferencesMessage && (
                <div className={`p-3 rounded-md ${
                  preferencesMessage.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                }`}>
                  <p className="text-sm">{preferencesMessage.text}</p>
                </div>
              )}

              <div>
                <label className="label">
                  {t('profile.preferences.language')}
                </label>
                <select 
                  className="input"
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                >
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
                        checked={preferences.regions.includes(region)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferences(prev => ({ 
                              ...prev, 
                              regions: [...prev.regions, region] 
                            }));
                          } else {
                            setPreferences(prev => ({ 
                              ...prev, 
                              regions: prev.regions.filter(r => r !== region) 
                            }));
                          }
                        }}
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
                <select 
                  className="input"
                  value={preferences.theme}
                  onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                >
                  <option value="light">{t('common.light')}</option>
                  <option value="dark">{t('common.dark')}</option>
                  <option value="system">{t('common.system')}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                className="btn btn-primary"
                onClick={handleSavePreferences}
                disabled={isSavingPreferences}
              >
                {isSavingPreferences ? (
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {t('common.save')}
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
              {user.preferredRegions && user.preferredRegions.length > 0 ? (
                user.preferredRegions.map((region) => (
                  <div key={region} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{region}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.floor(Math.random() * 10) + 1} preços
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma região selecionada
                </p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acções Rápidas
            </h3>
            <div className="space-y-2">
              <button 
                className="btn btn-outline w-full text-sm"
                onClick={() => setIsEditFormOpen(true)}
              >
                {t('profile.actions.editProfile')}
              </button>
                              <button className="btn btn-outline w-full text-sm">
                  {t('profile.actions.changePassword')}
                </button>
                <button className="btn btn-outline w-full text-sm text-red-600 border-red-200 hover:bg-red-50">
                  {t('profile.actions.logout')}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form Modal */}
      {isEditFormOpen && (
        <EditProfileFormWorking
          onClose={() => setIsEditFormOpen(false)}
          onSuccess={() => {
            setIsEditFormOpen(false);
            // Optionally refresh user data or show success message
          }}
        />
      )}
    </div>
  );
}



