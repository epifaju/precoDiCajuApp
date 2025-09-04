import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
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
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  
  // Filtres
  const [filters, setFilters] = useState({
    role: '',
    active: '',
    emailVerified: '',
    search: ''
  });

  // État pour afficher/masquer les filtres sur mobile
  const [showFilters, setShowFilters] = useState(false);

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
  const [formErrors] = useState<Record<string, string>>({});

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
      setTotalElements(response.totalElements);
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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header - Enhanced Mobile Responsiveness */}
      <div className="mb-6 sm:mb-8">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Title Card */}
            <div className="admin-header-card bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-4 shadow-sm border border-purple-100 dark:border-gray-600">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {t('admin.title', 'Administration des Utilisateurs')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                {t('admin.description', 'Gérez les utilisateurs de la plateforme')}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {t('admin.title', 'Administration des Utilisateurs')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-3 max-w-3xl">
            {t('admin.description', 'Gérez les utilisateurs de la plateforme')}
          </p>
        </div>
      </div>

      {/* Statistiques - Enhanced Mobile Responsiveness */}
      {stats && (
        <div className="mb-6 sm:mb-8">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="admin-stats-card bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-4 shadow-sm border border-blue-100 dark:border-gray-600">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 text-center flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('admin.stats.overview', 'Vue d\'ensemble des utilisateurs')}
              </h3>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Total Users */}
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {stats.totalUsers}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    {t('admin.stats.total', 'Total')}
                  </div>
                </div>

                {/* Active Users */}
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {stats.activeUsers}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 font-medium">
                    {t('admin.stats.active', 'Actifs')}
                  </div>
                </div>

                {/* Admin Users */}
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {stats.adminUsers}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                    {t('admin.stats.admins', 'Admins')}
                  </div>
                </div>

                {/* Moderator Users */}
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {stats.moderatorUsers}
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                    {t('admin.stats.moderators', 'Modérateurs')}
                  </div>
                </div>

                {/* Contributor Users */}
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800/30">
                  <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">
                    {stats.contributorUsers}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {t('admin.stats.contributors', 'Contributeurs')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t('admin.stats.overview', 'Vue d\'ensemble des utilisateurs')}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* Total Users */}
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {t('admin.stats.total', 'Total')}
                </div>
              </div>

              {/* Active Users */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {stats.activeUsers}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                  {t('admin.stats.active', 'Actifs')}
                </div>
              </div>

              {/* Admin Users */}
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {stats.adminUsers}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  {t('admin.stats.admins', 'Admins')}
                </div>
              </div>

              {/* Moderator Users */}
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {stats.moderatorUsers}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  {t('admin.stats.moderators', 'Modérateurs')}
                </div>
              </div>

              {/* Contributor Users */}
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800/30">
                <div className="text-2xl sm:text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                  {stats.contributorUsers}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {t('admin.stats.contributors', 'Contributeurs')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et actions - Enhanced Mobile Responsiveness */}
      <div className="space-y-4 mb-6">
        {/* Mobile Filter Toggle */}
        <div className="sm:hidden">
          <Button
            variant="outline"
            onClick={() => setShowFilters(prev => !prev)}
            className="w-full justify-between h-12 text-sm font-medium mx-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('admin.filters.title', 'Filtres et Recherche')}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform duration-200 text-purple-600 dark:text-purple-400 ${showFilters ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>

        {/* Filtres et recherche - Enhanced Mobile Design */}
        <div className={`admin-filters-card space-y-4 p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 mx-2 sm:mx-0 ${
          showFilters ? 'block opacity-100' : 'hidden sm:block opacity-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('admin.filters.title', 'Filtres et Recherche')}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFilters({ role: '', active: '', emailVerified: '', search: '' })} 
              className="text-sm px-4 py-2 h-10 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg"
            >
              {t('admin.filters.clearAll', 'Effacer tout')}
            </Button>
          </div>

          {/* Mobile-first grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Recherche - Full width on mobile, spans 2 on small screens */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Input
                placeholder={String(t('admin.filters.searchPlaceholder', 'Email ou nom...'))}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                leftIcon={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                className="h-11"
              />
            </div>

            {/* Rôle */}
            <div className="col-span-1">
              <Select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                options={[
                  { value: '', label: String(t('admin.filters.allRoles', 'Tous les rôles')) },
                  { value: 'ADMIN', label: String(t('admin.roles.admin', 'Admin')) },
                  { value: 'MODERATOR', label: String(t('admin.roles.moderator', 'Modérateur')) },
                  { value: 'CONTRIBUTOR', label: String(t('admin.roles.contributor', 'Contributeur')) }
                ]}
                className="h-11"
              />
            </div>

            {/* Statut */}
            <div className="col-span-1">
              <Select
                value={filters.active}
                onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
                options={[
                  { value: '', label: String(t('admin.filters.allStatus', 'Tous')) },
                  { value: 'true', label: String(t('admin.filters.active', 'Actif')) },
                  { value: 'false', label: String(t('admin.filters.inactive', 'Inactif')) }
                ]}
                className="h-11"
              />
            </div>
          </div>

          {/* Actions - Enhanced Mobile Design */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto justify-center h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-600 dark:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('admin.actions.create', 'Créer un utilisateur')}
            </Button>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs - Enhanced Mobile Design */}
      <Card className="admin-users-card mx-2 sm:mx-0">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            {t('admin.users.title', 'Utilisateurs')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-gray-500 dark:text-gray-400">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('common.loading', 'Chargement...')}
              </div>
            </div>
          ) : (
            <>
              {/* Vue mobile : Enhanced Cards */}
              <div className="block lg:hidden space-y-4 p-4 sm:p-6">
                {users.map((user) => (
                  <div key={user.id} className="admin-user-card bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-200">
                    {/* En-tête de la carte */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {user.fullName || String(t('admin.users.noName', 'Sans nom'))}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            📞 {user.phone}
                          </p>
                        )}
                      </div>
                      
                      {/* Statut et rôle */}
                      <div className="flex flex-col items-end space-y-2 ml-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          user.role === 'MODERATOR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {t(`admin.roles.${user.role.toLowerCase()}`, user.role) || user.role}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {user.active ? t('admin.users.active', 'Actif') : t('admin.users.inactive', 'Inactif')}
                        </span>
                      </div>
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400">⭐</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {user.reputationScore} {t('admin.users.reputation', 'Réputation')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400">✉️</span>
                        <span className={`${
                          user.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {user.emailVerified ? t('admin.users.verified', 'Vérifié') : t('admin.users.notVerified', 'Non vérifié')}
                        </span>
                      </div>
                    </div>

                    {/* Actions - Enhanced Mobile Buttons */}
                    <div className="flex flex-col space-y-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(user)}
                        className="admin-button w-full justify-center h-11 text-sm font-medium rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 transition-all duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t('admin.actions.edit', 'Modifier')}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPasswordModal(user)}
                        className="admin-button w-full justify-center h-11 text-sm font-medium rounded-lg border-2 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-300 transition-all duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        {t('admin.actions.password', 'Mot de passe')}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={user.active ? "destructive" : "outline"}
                        onClick={() => handleToggleUserStatus(user.id, user.active)}
                        className={`admin-button w-full justify-center h-11 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                          user.active 
                            ? 'border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300' 
                            : 'border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user.active ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                        {user.active ? t('admin.actions.deactivate', 'Désactiver') : t('admin.actions.activate', 'Activer')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vue tablette : Tableau simplifié */}
              <div className="hidden lg:block xl:hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.name', 'Nom')}
                        </th>
                        <th className="text-left p-3 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.email', 'Email')}
                        </th>
                        <th className="text-left p-3 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.role', 'Rôle')}
                        </th>
                        <th className="text-left p-3 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.status', 'Statut')}
                        </th>
                        <th className="text-left p-3 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.actions', 'Actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-sm text-gray-900 dark:text-white">{user.fullName}</div>
                              {user.phone && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{user.phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.emailVerified ? (
                                  <span className="text-green-600 dark:text-green-400">✓ {t('admin.users.verified', 'Vérifié')}</span>
                                ) : (
                                  <span className="text-red-600 dark:text-red-400">✗ {t('admin.users.notVerified', 'Non vérifié')}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              user.role === 'MODERATOR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {t(`admin.roles.${user.role.toLowerCase()}`, user.role) || user.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {user.active ? t('admin.users.active', 'Actif') : t('admin.users.inactive', 'Inactif')}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col space-y-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(user)}
                                className="h-8 text-xs px-3"
                              >
                                {t('admin.actions.edit', 'Modifier')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPasswordModal(user)}
                                className="h-8 text-xs px-3"
                              >
                                {t('admin.actions.password', 'Mot de passe')}
                              </Button>
                              <Button
                                size="sm"
                                variant={user.active ? "destructive" : "outline"}
                                onClick={() => handleToggleUserStatus(user.id, user.active)}
                                className="h-8 text-xs px-3"
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
              </div>

              {/* Vue desktop : Tableau complet */}
              <div className="hidden xl:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-4 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.name', 'Nom')}
                        </th>
                        <th className="text-left p-4 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.email', 'Email')}
                        </th>
                        <th className="text-left p-4 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.role', 'Rôle')}
                        </th>
                        <th className="text-left p-4 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.status', 'Statut')}
                        </th>
                        <th className="text-left p-4 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.reputation', 'Réputation')}
                        </th>
                        <th className="text-left p-4 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {t('admin.users.actions', 'Actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                              {user.phone && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="text-gray-900 dark:text-white">{user.email}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.emailVerified ? (
                                  <span className="text-green-600 dark:text-green-400">✓ {t('admin.users.verified', 'Vérifié')}</span>
                                ) : (
                                  <span className="text-red-600 dark:text-red-400">✗ {t('admin.users.notVerified', 'Non vérifié')}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              user.role === 'MODERATOR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {t(`admin.roles.${user.role.toLowerCase()}`, user.role) || user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              user.active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {user.active ? t('admin.users.active', 'Actif') : t('admin.users.inactive', 'Inactif')}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">⭐</span>
                              <span className="text-gray-900 dark:text-white font-medium">{user.reputationScore}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(user)}
                                className="h-9 px-4 text-sm"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {t('admin.actions.edit', 'Modifier')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPasswordModal(user)}
                                className="h-9 px-4 text-sm"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                {t('admin.actions.password', 'Mot de passe')}
                              </Button>
                              <Button
                                size="sm"
                                variant={user.active ? "destructive" : "outline"}
                                onClick={() => handleToggleUserStatus(user.id, user.active)}
                                className="h-9 px-4 text-sm"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user.active ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                </svg>
                                {user.active ? t('admin.actions.deactivate', 'Désactiver') : t('admin.actions.activate', 'Activer')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination - Design responsive amélioré */}
              {totalPages > 1 && (
                <div className="mt-6 px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Informations de pagination */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                      {t('common.showing', 'Affichage de')} <span className="font-medium">{currentPage * pageSize + 1}</span> {t('common.to', 'à')} <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> {t('common.of', 'sur')} <span className="font-medium">{totalElements}</span> {t('admin.users.results', 'résultats')}
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="h-9 px-3 text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('common.previous', 'Précédent')}
                      </Button>
                      
                      {/* Indicateurs de page */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                          if (pageNum >= totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "primary" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="h-8 w-8 p-0 text-sm"
                            >
                              {pageNum + 1}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="h-9 px-3 text-sm"
                      >
                        {t('common.next', 'Suivant')}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
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
