import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { useApi } from '../hooks/useApi';
import { UserDTO, UserRole } from '../types/api';
import { useAuthStore } from '../store/authStore';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  contributorUsers: number;
}

interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const api = useApi();

  // États
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20);
  
  // Filtres
  const [filters, setFilters] = useState({
    role: '',
    active: '',
    emailVerified: '',
    search: ''
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'CONTRIBUTOR' as UserRole,
    emailVerified: false,
    active: true
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    role: 'CONTRIBUTOR' as UserRole,
    reputationScore: 0,
    emailVerified: false,
    active: true
  });

  const [newPassword, setNewPassword] = useState('');

  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Vérifier les permissions
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      console.log("user : ", user);
      // Rediriger vers la page d'accueil si pas admin
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Charger les données
  useEffect(() => {
    console.log(user, user?.role);
    if (user?.role === 'ADMIN') {
      loadUsers();
      loadStats();
    }
  }, [user, currentPage, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        ...(filters.role && { role: filters.role }),
        ...(filters.active && { active: filters.active }),
        ...(filters.emailVerified && { emailVerified: filters.emailVerified }),
        ...(filters.search && { search: filters.search })
      });
     
      console.log("params :", params);
      const response = await api.get<PageResponse<UserDTO>>(`/api/v1/admin/users?${params}`);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      // Afficher un message d'erreur plus clair
      const errorMessage = error.data?.message || error.message || 'Erreur lors du chargement des utilisateurs';
      // Utiliser une notification ou un toast au lieu d'alert
      console.error(`Erreur: ${errorMessage}`);
      // Ici vous pourriez utiliser un système de notification comme react-toastify
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get<UserStats>('/api/v1/admin/users/stats');
      setStats(response);
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Afficher un message d'erreur plus clair
      const errorMessage = error.data?.message || error.message || 'Erreur lors du chargement des statistiques';
      console.error(`Erreur: ${errorMessage}`);
      // Ici vous pourriez utiliser un système de notification comme react-toastify
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/api/v1/admin/users', createForm);
      setShowCreateModal(false);
      setCreateForm({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'CONTRIBUTOR',
        emailVerified: false,
        active: true
      });
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      await api.put(`/api/v1/admin/users/${selectedUser.id}`, editForm);
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;
    
    try {
              await api.post(`/api/v1/admin/users/${selectedUser.id}/change-password`, {
        newPassword
      });
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.delete(`/api/v1/admin/users/${userId}`);
      } else {
        await api.post(`/api/v1/admin/users/${userId}/activate`);
      }
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const openEditModal = (user: UserDTO) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || '',
      phone: user.phone || '',
      role: user.role,
      reputationScore: user.reputationScore,
      emailVerified: user.emailVerified,
      active: user.active
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: UserDTO) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('admin.title', 'Administration des Utilisateurs')}
        </h1>
        <p className="text-gray-600">
          {t('admin.description', 'Gérez les utilisateurs de la plateforme')}
        </p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">{t('admin.stats.total', 'Total')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              <div className="text-sm text-gray-600">{t('admin.stats.active', 'Actifs')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.adminUsers}</div>
              <div className="text-sm text-gray-600">{t('admin.stats.admins', 'Admins')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.moderatorUsers}</div>
              <div className="text-sm text-gray-600">{t('admin.stats.moderators', 'Modérateurs')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.contributorUsers}</div>
              <div className="text-sm text-gray-600">{t('admin.stats.contributors', 'Contributeurs')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.filters.search', 'Recherche')}
              </label>
              <Input
                placeholder={t('admin.filters.searchPlaceholder', 'Email ou nom...')}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 {t('admin.filters.role', 'Rôle')}
               </label>
               <Select
                 value={filters.role}
                 onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                 options={[
                   { value: '', label: String(t('admin.filters.allRoles', 'Tous les rôles') || 'Tous les rôles') },
                   { value: 'ADMIN', label: String(t('admin.roles.admin', 'Admin') || 'Admin') },
                   { value: 'MODERATOR', label: String(t('admin.roles.moderator', 'Modérateur') || 'Modérateur') },
                   { value: 'CONTRIBUTOR', label: String(t('admin.roles.contributor', 'Contributeur') || 'Contributeur') }
                 ]}
                 className="w-40"
               />
             </div>

                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 {t('admin.filters.status', 'Statut')}
               </label>
               <Select
                 value={filters.active}
                 onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
                 options={[
                   { value: '', label: String(t('admin.filters.allStatus', 'Tous') || 'Tous') },
                   { value: 'true', label: String(t('admin.filters.active', 'Actif') || 'Actif') },
                   { value: 'false', label: String(t('admin.filters.inactive', 'Inactif') || 'Inactif') }
                 ]}
                 className="w-32"
               />
             </div>

            <Button onClick={() => setShowCreateModal(true)}>
              {t('admin.actions.create', 'Créer un utilisateur')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.title', 'Utilisateurs')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">{t('common.loading', 'Chargement...')}</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">{t('admin.users.name', 'Nom')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.users.email', 'Email')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.users.role', 'Rôle')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.users.status', 'Statut')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.users.reputation', 'Réputation')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.users.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div>{user.email}</div>
                            <div className="text-sm text-gray-500">
                              {user.emailVerified ? (
                                <span className="text-green-600">✓ {t('admin.users.verified', 'Vérifié')}</span>
                              ) : (
                                <span className="text-red-600">✗ {t('admin.users.notVerified', 'Non vérifié')}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'MODERATOR' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {t(`admin.roles.${user.role.toLowerCase()}`, user.role) || user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.active ? t('admin.users.active', 'Actif') : t('admin.users.inactive', 'Inactif')}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{user.reputationScore}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(user)}
                            >
                              {t('admin.actions.edit', 'Modifier')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPasswordModal(user)}
                            >
                              {t('admin.actions.password', 'Mot de passe')}
                            </Button>
                            <Button
                              size="sm"
                              variant={user.active ? "destructive" : "outline"}
                              onClick={() => handleToggleUserStatus(user.id, user.active)}
                            >
                              {user.active ? t('admin.actions.deactivate', 'Désactiver') : t('admin.actions.activate', 'Activer')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      {t('common.previous', 'Précédent')}
                    </Button>
                    <span className="flex items-center px-3">
                      {t('common.page', 'Page')} {currentPage + 1} {t('common.of', 'sur')} {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages - 1}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      {t('common.next', 'Suivant')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">{t('admin.create.title', 'Créer un utilisateur')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.create.email', 'Email')} *
                </label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                />
                {formErrors['email'] && <p className="text-red-500 text-xs mt-1">{formErrors['email']}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.create.password', 'Mot de passe')} *
                </label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                />
                {formErrors['password'] && <p className="text-red-500 text-xs mt-1">{formErrors['password']}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.create.fullName', 'Nom complet')} *
                </label>
                <Input
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                />
                {formErrors['fullName'] && <p className="text-red-500 text-xs mt-1">{formErrors['fullName']}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.create.phone', 'Téléphone')}
                </label>
                <Input
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                />
                {formErrors['phone'] && <p className="text-red-500 text-xs mt-1">{formErrors['phone']}</p>}
              </div>
              
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   {t('admin.create.role', 'Rôle')}
                 </label>
                 <Select
                   value={createForm.role}
                   onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                   options={[
                     { value: 'CONTRIBUTOR', label: t('admin.roles.contributor', 'Contributeur') },
                     { value: 'MODERATOR', label: t('admin.roles.moderator', 'Modérateur') },
                     { value: 'ADMIN', label: t('admin.roles.admin', 'Admin') }
                   ]}
                 />
               </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createForm.emailVerified}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, emailVerified: e.target.checked }))}
                    className="mr-2"
                  />
                  {t('admin.create.emailVerified', 'Email vérifié')}
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createForm.active}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="mr-2"
                  />
                  {t('admin.create.active', 'Actif')}
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel', 'Annuler')}
              </Button>
              <Button onClick={handleCreateUser}>
                {t('admin.create.submit', 'Créer')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {t('admin.edit.title', 'Modifier')} {selectedUser.fullName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.edit.fullName', 'Nom complet')}
                </label>
                <Input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.edit.phone', 'Téléphone')}
                </label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   {t('admin.edit.role', 'Rôle')}
                 </label>
                 <Select
                   value={editForm.role}
                   onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                   options={[
                     { value: 'CONTRIBUTOR', label: t('admin.roles.contributor', 'Contributeur') },
                     { value: 'MODERATOR', label: t('admin.roles.moderator', 'Modérateur') },
                     { value: 'ADMIN', label: t('admin.roles.admin', 'Admin') }
                   ]}
                 />
               </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.edit.reputationScore', 'Score de réputation')}
                </label>
                <Input
                  type="number"
                  value={editForm.reputationScore}
                  onChange={(e) => setEditForm(prev => ({ ...prev, reputationScore: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.emailVerified}
                    onChange={(e) => setEditForm(prev => ({ ...prev, emailVerified: e.target.checked }))}
                    className="mr-2"
                  />
                  {t('admin.edit.emailVerified', 'Email vérifié')}
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(e) => setEditForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="mr-2"
                  />
                  {t('admin.edit.active', 'Actif')}
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                {t('common.cancel', 'Annuler')}
              </Button>
              <Button onClick={handleUpdateUser}>
                {t('admin.edit.submit', 'Mettre à jour')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {t('admin.password.title', 'Changer le mot de passe pour')} {selectedUser.fullName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.password.newPassword', 'Nouveau mot de passe')} *
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                {t('common.cancel', 'Annuler')}
              </Button>
              <Button onClick={handleChangePassword}>
                {t('admin.password.submit', 'Changer')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
