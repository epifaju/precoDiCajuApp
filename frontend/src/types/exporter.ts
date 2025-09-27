// Types pour le module Exportateurs Agréés

export enum ExportateurType {
  EXPORTATEUR = 'EXPORTATEUR',
  ACHETEUR_LOCAL = 'ACHETEUR_LOCAL'
}

export enum StatutType {
  ACTIF = 'ACTIF',
  EXPIRE = 'EXPIRE',
  SUSPENDU = 'SUSPENDU'
}

export interface Exportateur {
  id: string;
  nom: string;
  numeroAgrement: string;
  type: ExportateurType;
  regionCode: string;
  regionName: string;
  telephone?: string;
  email?: string;
  qrCodeToken: string;
  dateCertification: string;
  dateExpiration: string;
  statut: StatutType;
  createdAt: string;
  updatedAt: string;
  actif: boolean;
  expire: boolean;
  suspendu: boolean;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  result: string;
  exportateurId?: string;
  nom?: string;
  numeroAgrement?: string;
  type?: ExportateurType;
  regionCode?: string;
  regionName?: string;
  telephone?: string;
  email?: string;
  dateCertification?: string;
  dateExpiration?: string;
  statut?: StatutType;
  actif?: boolean;
  expire?: boolean;
  suspendu?: boolean;
  verificationTime: string;
}

export interface ExportateurFilters {
  regionCode?: string;
  type?: ExportateurType;
  statut?: StatutType;
  nom?: string;
}

export interface ExportateurCreateRequest {
  nom: string;
  numeroAgrement: string;
  type: ExportateurType;
  regionCode: string;
  telephone?: string;
  email?: string;
  dateCertification: string;
  dateExpiration: string;
  statut?: StatutType;
}

export interface ExportateurUpdateRequest {
  nom?: string;
  telephone?: string;
  email?: string;
  dateCertification?: string;
  dateExpiration?: string;
  statut?: StatutType;
}

export interface QRCodeInfo {
  uuid: string;
  timestamp: number;
  random: string;
}

// Types pour les statistiques
export interface ExportateurStats {
  total: number;
  actifs: number;
  expires: number;
  suspendus: number;
  byRegion: Record<string, number>;
  byType: Record<string, number>;
}

// Types pour les logs de vérification
export interface VerificationLog {
  id: string;
  exportateurId: string;
  userSession: string;
  verificationTime: string;
  result: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

// Types pour les réponses paginées
export interface ExportateurPageResponse {
  content: Exportateur[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
