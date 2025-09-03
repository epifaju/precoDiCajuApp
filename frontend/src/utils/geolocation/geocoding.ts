import { GpsCoordinates } from '../../types/api';

export interface GeocodingResult {
  address: string;
  components: {
    country?: string;
    region?: string;
    city?: string;
    village?: string;
    road?: string;
    postcode?: string;
    state?: string;
    town?: string;
    hamlet?: string;
  };
  formatted: string;
  confidence: number;
  source: 'nominatim' | 'cache' | 'fallback';
  timestamp: number;
}

export interface GeocodingOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  language?: string;
  zoom?: number;
  addressdetails?: boolean;
}

export interface GeocodingCache {
  [key: string]: GeocodingResult;
}

// Cache pour les résultats de géocodage
const geocodingCache: GeocodingCache = {};

// Configuration par défaut
const DEFAULT_OPTIONS: Required<GeocodingOptions> = {
  timeout: 10000,
  retries: 3,
  cache: true,
  language: 'pt',
  zoom: 18,
  addressdetails: true,
};

/**
 * Génère une clé de cache pour les coordonnées
 */
function getCacheKey(coordinates: GpsCoordinates, precision: number = 4): string {
  const lat = Math.round(coordinates.latitude * Math.pow(10, precision)) / Math.pow(10, precision);
  const lng = Math.round(coordinates.longitude * Math.pow(10, precision)) / Math.pow(10, precision);
  return `${lat},${lng}`;
}

/**
 * Vérifie si le cache contient un résultat
 */
function getCachedResult(coordinates: GpsCoordinates): GeocodingResult | null {
  const cacheKey = getCacheKey(coordinates);
  const cached = geocodingCache[cacheKey];
  
  if (cached) {
    // Vérifier si le cache n'est pas trop ancien (24h)
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    if (Date.now() - cached.timestamp < maxAge) {
      return { ...cached, source: 'cache' };
    } else {
      // Supprimer le cache expiré
      delete geocodingCache[cacheKey];
    }
  }
  
  return null;
}

/**
 * Met en cache un résultat de géocodage
 */
function setCachedResult(coordinates: GpsCoordinates, result: GeocodingResult): void {
  const cacheKey = getCacheKey(coordinates);
  geocodingCache[cacheKey] = {
    ...result,
    source: 'nominatim',
    timestamp: Date.now(),
  };
}

/**
 * Effectue un géocodage inverse avec retry et cache
 */
export async function reverseGeocode(
  coordinates: GpsCoordinates,
  options: GeocodingOptions = {}
): Promise<GeocodingResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Vérifier le cache d'abord
  if (opts.cache) {
    const cached = getCachedResult(coordinates);
    if (cached) {
      return cached;
    }
  }
  
  // Effectuer le géocodage avec retry
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= opts.retries; attempt++) {
    try {
      const result = await performReverseGeocode(coordinates, opts);
      
      // Mettre en cache le résultat
      if (opts.cache) {
        setCachedResult(coordinates, result);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Attendre avant de réessayer (backoff exponentiel)
      if (attempt < opts.retries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Si tous les essais ont échoué, retourner un résultat de fallback
  return createFallbackResult(coordinates);
}

/**
 * Effectue le géocodage inverse via l'API Nominatim
 */
async function performReverseGeocode(
  coordinates: GpsCoordinates,
  options: Required<GeocodingOptions>
): Promise<GeocodingResult> {
  const { latitude, longitude } = coordinates;
  
  const params = new URLSearchParams({
    format: 'json',
    lat: latitude.toString(),
    lon: longitude.toString(),
    zoom: options.zoom.toString(),
    addressdetails: options.addressdetails.toString(),
    'accept-language': options.language,
  });
  
  const url = `https://nominatim.openstreetmap.org/reverse?${params}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PrecoDiCaju/1.0 (Geolocation App)',
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || data.error) {
      throw new Error(data.error || 'No geocoding data received');
    }
    
    return parseNominatimResponse(data);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Parse la réponse de l'API Nominatim
 */
function parseNominatimResponse(data: any): GeocodingResult {
  const address = data.address || {};
  
  // Construire l'adresse formatée
  const addressParts = [];
  
  if (address.road) addressParts.push(address.road);
  if (address.village || address.town || address.city) {
    addressParts.push(address.village || address.town || address.city);
  }
  if (address.state || address.region) {
    addressParts.push(address.state || address.region);
  }
  if (address.country) addressParts.push(address.country);
  
  const formatted = addressParts.length > 0 
    ? addressParts.join(', ')
    : data.display_name || 'Localização desconhecida';
  
  return {
    address: data.display_name || formatted,
    components: {
      country: address.country,
      region: address.state || address.region,
      city: address.city || address.town,
      village: address.village || address.hamlet,
      road: address.road,
      postcode: address.postcode,
      state: address.state,
      town: address.town,
      hamlet: address.hamlet,
    },
    formatted,
    confidence: parseFloat(data.importance || '0.5'),
    source: 'nominatim',
    timestamp: Date.now(),
  };
}

/**
 * Crée un résultat de fallback quand le géocodage échoue
 */
function createFallbackResult(coordinates: GpsCoordinates): GeocodingResult {
  const { latitude, longitude } = coordinates;
  
  // Déterminer la région approximative
  let region = 'Guiné-Bissau';
  if (latitude > 12.0) region = 'Norte da Guiné-Bissau';
  else if (latitude < 11.5) region = 'Sul da Guiné-Bissau';
  
  if (longitude > -15.0) region += ' (Leste)';
  else if (longitude < -15.5) region += ' (Oeste)';
  
  return {
    address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    components: {
      country: 'Guiné-Bissau',
      region,
    },
    formatted: `${region} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    confidence: 0.1,
    source: 'fallback',
    timestamp: Date.now(),
  };
}

/**
 * Effectue un géocodage direct (adresse vers coordonnées)
 */
export async function forwardGeocode(
  address: string,
  options: GeocodingOptions = {}
): Promise<GpsCoordinates[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const params = new URLSearchParams({
    format: 'json',
    q: address,
    countrycodes: 'gw', // Limiter à la Guinée-Bissau
    limit: '10',
    addressdetails: '1',
    'accept-language': opts.language,
  });
  
  const url = `https://nominatim.openstreetmap.org/search?${params}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PrecoDiCaju/1.0 (Geolocation App)',
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid geocoding response');
    }
    
    return data.map((item: any) => ({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      accuracy: 100, // Précision par défaut pour le géocodage direct
      timestamp: Date.now(),
    }));
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Nettoie le cache de géocodage
 */
export function clearGeocodingCache(): void {
  Object.keys(geocodingCache).forEach(key => {
    delete geocodingCache[key];
  });
}

/**
 * Obtient les statistiques du cache
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: Object.keys(geocodingCache).length,
    keys: Object.keys(geocodingCache),
  };
}

/**
 * Valide une adresse
 */
export function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  const trimmed = address.trim();
  if (trimmed.length < 3) return false;
  
  // Vérifier qu'il n'y a pas que des chiffres
  if (/^\d+$/.test(trimmed)) return false;
  
  return true;
}

/**
 * Normalise une adresse
 */
export function normalizeAddress(address: string): string {
  if (!address) return '';
  
  return address
    .trim()
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
    .replace(/[^\w\s,.-]/g, '') // Supprimer les caractères spéciaux
    .toLowerCase();
}

/**
 * Calcule la similarité entre deux adresses
 */
export function calculateAddressSimilarity(address1: string, address2: string): number {
  const norm1 = normalizeAddress(address1);
  const norm2 = normalizeAddress(address2);
  
  if (norm1 === norm2) return 1;
  
  // Algorithme de similarité simple (Jaccard)
  const words1 = new Set(norm1.split(/\s+/));
  const words2 = new Set(norm2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Trouve l'adresse la plus similaire dans une liste
 */
export function findMostSimilarAddress(
  targetAddress: string,
  addresses: string[],
  threshold: number = 0.5
): string | null {
  let bestMatch = null;
  let bestScore = 0;
  
  for (const address of addresses) {
    const score = calculateAddressSimilarity(targetAddress, address);
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = address;
    }
  }
  
  return bestMatch;
}

