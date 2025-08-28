// Core entities matching backend DTOs
export interface PriceDTO {
  id: string;
  region: string;
  regionName: string;
  quality: string;
  qualityName: string;
  priceFcfa: number;
  unit: string;
  recordedDate: string;
  sourceName?: string;
  sourceType?: string;
  photoUrl?: string;
  notes?: string;
  verified: boolean;
  createdAt: string;
  gpsLat?: number;
  gpsLng?: number;
  createdBy?: UserDTO;
}

export interface CreatePriceRequest {
  regionCode: string;
  qualityGrade: string;
  priceFcfa: number;
  sourceName?: string;
  sourceType?: string;
  notes?: string;
  photoFile?: File;
  gpsLat?: number;
  gpsLng?: number;
}

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  reputationScore: number;
  preferredRegions: string[];
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface RegionDTO {
  code: string;
  namePt: string;
  nameFr?: string;
  nameEn?: string;
  active: boolean;
}

export interface QualityGradeDTO {
  code: string;
  namePt: string;
  nameFr?: string;
  nameEn?: string;
  descriptionPt?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  active: boolean;
}

// Pagination
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Statistics
export interface PriceStatsDTO {
  totalPrices: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  pricesByRegion: Record<string, number>;
  pricesByQuality: Record<string, number>;
  recentPriceChange: number;
  lastUpdated: string;
}

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Enums
export type UserRole = 'ADMIN' | 'MODERATOR' | 'CONTRIBUTOR';
export type SourceType = 'market' | 'cooperative' | 'producer' | 'trader' | 'other';
export type Language = 'pt' | 'fr' | 'en';

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Error types
export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Filters
export interface PriceFilters {
  regionCode?: string;
  qualityGrade?: string;
  fromDate?: string;
  toDate?: string;
  verified?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

// Upload response
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

// Notification
export interface NotificationDTO {
  id: string;
  type: 'PRICE_ALERT' | 'VERIFICATION' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'PRICE_UPDATE' | 'PRICE_VERIFICATION' | 'USER_ACTIVITY';
  payload: any;
  timestamp: string;
}

// GPS coordinates
export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}
