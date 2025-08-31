import { create } from 'zustand';

export interface Region {
  code: string;
  namePt: string;
  nameFr: string;
  nameEn: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QualityGrade {
  code: string;
  namePt: string;
  nameFr: string;
  nameEn: string;
  descriptionPt: string;
  descriptionFr: string;
  descriptionEn: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  id: string;
  region: string;
  regionName: string;
  quality: string;
  qualityName: string;
  priceFcfa: number;
  unit: string;
  recordedDate: string;
  sourceName: string;
  sourceType: string;
  gpsLat?: number;
  gpsLng?: number;
  photoUrl?: string;
  notes?: string;
  verified: boolean;
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
  verifiedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  verifiedAt?: string;
  createdAt: string;
}

export interface PriceStats {
  totalPrices: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange: number;
  pricesByRegion: Record<string, number>;
  pricesByQuality: Record<string, number>;
  averagePricesByRegion: Record<string, number>;
  averagePricesByQuality: Record<string, number>;
  verifiedPrices: number;
  unverifiedPrices: number;
  lastUpdated: string;
  periodDays: number;
}

interface AppState {
  // Reference data
  regions: Region[];
  qualityGrades: QualityGrade[];
  
  // App state
  language: 'pt' | 'fr' | 'en';
  theme: 'light' | 'dark';
  
  // Loading states
  isLoadingRegions: boolean;
  isLoadingQualities: boolean;
  
  // Cache timestamps
  regionsLastFetch: number | null;
  qualitiesLastFetch: number | null;
}

interface AppActions {
  // Language and theme
  setLanguage: (language: 'pt' | 'fr' | 'en') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Reference data loading
  fetchRegions: () => Promise<void>;
  fetchQualityGrades: () => Promise<void>;
  
  // Utility functions
  getRegionName: (regionCode: string) => string;
  getQualityName: (qualityCode: string) => string;
  getQualityDescription: (qualityCode: string) => string;
}

type AppStore = AppState & AppActions;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  regions: [],
  qualityGrades: [],
  language: 'pt',
  theme: 'light',
  isLoadingRegions: false,
  isLoadingQualities: false,
  regionsLastFetch: null,
  qualitiesLastFetch: null,

  // Actions
  setLanguage: (language) => {
    set({ language });
    localStorage.setItem('precaju-language', language);
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('precaju-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  toggleTheme: () => {
    const { theme, setTheme } = get();
    setTheme(theme === 'light' ? 'dark' : 'light');
  },

  fetchRegions: async () => {
    const { regionsLastFetch, isLoadingRegions } = get();
    const now = Date.now();
    
    // Skip if already loading or recently fetched
    if (isLoadingRegions || (regionsLastFetch && now - regionsLastFetch < CACHE_DURATION)) {
      return;
    }

    set({ isLoadingRegions: true });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/regions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch regions');
      }

      const regions = await response.json();
      
      set({
        regions,
        regionsLastFetch: now,
        isLoadingRegions: false,
      });
    } catch (error) {
      console.error('Error fetching regions:', error);
      set({ isLoadingRegions: false });
      throw error;
    }
  },

  fetchQualityGrades: async () => {
    const { qualitiesLastFetch, isLoadingQualities } = get();
    const now = Date.now();
    
    // Skip if already loading or recently fetched
    if (isLoadingQualities || (qualitiesLastFetch && now - qualitiesLastFetch < CACHE_DURATION)) {
      return;
    }

    set({ isLoadingQualities: true });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/qualities`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quality grades');
      }

      const qualityGrades = await response.json();
      
      set({
        qualityGrades,
        qualitiesLastFetch: now,
        isLoadingQualities: false,
      });
    } catch (error) {
      console.error('Error fetching quality grades:', error);
      set({ isLoadingQualities: false });
      throw error;
    }
  },

  getRegionName: (regionCode: string) => {
    const { regions, language } = get();
    const region = regions.find(r => r.code === regionCode);
    
    if (!region) return regionCode;
    
    switch (language) {
      case 'fr': return region.nameFr;
      case 'en': return region.nameEn;
      default: return region.namePt;
    }
  },

  getQualityName: (qualityCode: string) => {
    const { qualityGrades, language } = get();
    const quality = qualityGrades.find(q => q.code === qualityCode);
    
    if (!quality) return qualityCode;
    
    switch (language) {
      case 'fr': return quality.nameFr;
      case 'en': return quality.nameEn;
      default: return quality.namePt;
    }
  },

  getQualityDescription: (qualityCode: string) => {
    const { qualityGrades, language } = get();
    const quality = qualityGrades.find(q => q.code === qualityCode);
    
    if (!quality) return '';
    
    switch (language) {
      case 'fr': return quality.descriptionFr;
      case 'en': return quality.descriptionEn;
      default: return quality.descriptionPt;
    }
  },
}));

// Initialize theme and language from localStorage
const initializeApp = () => {
  const savedTheme = localStorage.getItem('precaju-theme') as 'light' | 'dark' | null;
  const savedLanguage = localStorage.getItem('precaju-language') as 'pt' | 'fr' | 'en' | null;
  
  if (savedTheme) {
    useAppStore.getState().setTheme(savedTheme);
  }
  
  if (savedLanguage) {
    useAppStore.getState().setLanguage(savedLanguage);
  }
  
  // Fetch initial data
  useAppStore.getState().fetchRegions().catch(console.error);
  useAppStore.getState().fetchQualityGrades().catch(console.error);
};

// Call initialization
if (typeof window !== 'undefined') {
  initializeApp();
}



