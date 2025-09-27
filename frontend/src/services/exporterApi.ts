import { apiClient } from './apiClient';
import { 
  Exportateur, 
  VerificationResult, 
  ExportateurFilters, 
  ExportateurCreateRequest, 
  ExportateurUpdateRequest,
  ExportateurPageResponse,
  ExportateurType,
  StatutType
} from '../types/exporter';

export class ExporterApiService {
  private readonly baseUrl = '/api/v1/exportateurs';

  /**
   * Récupère tous les exportateurs avec pagination et filtres
   */
  async getExportateurs(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'nom',
    sortDir: string = 'asc',
    filters?: ExportateurFilters
  ): Promise<ExportateurPageResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    if (filters) {
      if (filters.regionCode) params.append('regionCode', filters.regionCode);
      if (filters.type) params.append('type', filters.type);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.nom) params.append('nom', filters.nom);
    }

    const response = await apiClient.get(`${this.baseUrl}?${params}`);
    return response as ExportateurPageResponse;
  }

  /**
   * Récupère un exportateur par son ID
   */
  async getExportateurById(id: string): Promise<Exportateur> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response as Exportateur;
  }

  /**
   * Vérifie un exportateur via son token QR code
   */
  async verifyByQrToken(qrToken: string): Promise<VerificationResult> {
    const response = await apiClient.get(`${this.baseUrl}/verify/${qrToken}`);
    return response as VerificationResult;
  }

  /**
   * Crée un nouvel exportateur (admin seulement)
   */
  async createExportateur(data: ExportateurCreateRequest): Promise<Exportateur> {
    const response = await apiClient.post(this.baseUrl, data);
    return response as Exportateur;
  }

  /**
   * Met à jour un exportateur (admin seulement)
   */
  async updateExportateur(id: string, data: ExportateurUpdateRequest): Promise<Exportateur> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response as Exportateur;
  }

  /**
   * Supprime un exportateur (admin seulement)
   */
  async deleteExportateur(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère les statistiques des exportateurs
   */
  async getStatistics(): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/statistics`);
    return response as any[];
  }

  /**
   * Récupère les exportateurs expirant bientôt
   */
  async getExpiringSoon(days: number = 30): Promise<Exportateur[]> {
    const response = await apiClient.get(`${this.baseUrl}/expiring-soon?days=${days}`);
    return response as Exportateur[];
  }

  /**
   * Récupère tous les exportateurs actifs d'une région
   */
  async getActiveByRegion(regionCode: string): Promise<Exportateur[]> {
    const response = await apiClient.get(`${this.baseUrl}?regionCode=${regionCode}&statut=ACTIF&size=100`);
    return response.content as Exportateur[];
  }

  /**
   * Recherche des exportateurs par nom
   */
  async searchByName(query: string): Promise<Exportateur[]> {
    const response = await apiClient.get(`${this.baseUrl}?nom=${encodeURIComponent(query)}&size=50`);
    return response.content as Exportateur[];
  }

  /**
   * Récupère les exportateurs par type
   */
  async getByType(type: ExportateurType): Promise<Exportateur[]> {
    const response = await apiClient.get(`${this.baseUrl}?type=${type}&size=100`);
    return response.content as Exportateur[];
  }

  /**
   * Récupère les exportateurs par statut
   */
  async getByStatut(statut: StatutType): Promise<Exportateur[]> {
    const response = await apiClient.get(`${this.baseUrl}?statut=${statut}&size=100`);
    return response.content as Exportateur[];
  }
}

// Instance singleton
export const exporterApiService = new ExporterApiService();
