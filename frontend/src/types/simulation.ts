// Types for Revenue Simulator feature
export interface SimulationInput {
  quantity: number; // kg
  pricePerKg: number; // FCFA per kg
  transportCosts: number; // FCFA
  otherCosts: number; // FCFA (sacs, main-d'œuvre, etc.)
}

export interface SimulationResult {
  grossRevenue: number; // Revenu brut = quantity * pricePerKg
  totalExpenses: number; // Dépenses totales = transportCosts + otherCosts
  netRevenue: number; // Revenu net = grossRevenue - totalExpenses
}

export interface Simulation {
  id: string;
  userId?: string; // Optional for offline mode
  inputs: SimulationInput;
  results: SimulationResult;
  createdAt: string;
  updatedAt?: string;
  isOffline?: boolean; // Flag to indicate if stored locally
}

export interface SimulationFormData {
  quantity: string;
  pricePerKg: string;
  transportCosts: string;
  otherCosts: string;
}

export interface SimulationValidationErrors {
  quantity?: string;
  pricePerKg?: string;
  transportCosts?: string;
  otherCosts?: string;
}

// IndexedDB storage interfaces
export interface OfflineSimulationData {
  id: string;
  data: Simulation;
  status: 'pending' | 'synced' | 'error';
  createdAt: string;
  syncedAt?: string;
  retryCount: number;
  lastError?: string;
}

// API interfaces
export interface CreateSimulationRequest {
  quantity: number;
  pricePerKg: number;
  transportCosts: number;
  otherCosts: number;
}

export interface SimulationResponse {
  id: string;
  userId: string;
  quantity: number;
  pricePerKg: number;
  transportCosts: number;
  otherCosts: number;
  grossRevenue: number;
  totalExpenses: number;
  netRevenue: number;
  createdAt: string;
  updatedAt?: string;
}

// Chart data interfaces
export interface RevenueChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

// Constants
export const DEFAULT_SIMULATION_INPUT: SimulationInput = {
  quantity: 0,
  pricePerKg: 0,
  transportCosts: 0,
  otherCosts: 0,
};

export const DEFAULT_SIMULATION_RESULT: SimulationResult = {
  grossRevenue: 0,
  totalExpenses: 0,
  netRevenue: 0,
};

// Validation constants
export const MIN_QUANTITY = 0;
export const MAX_QUANTITY = 1000000; // 1 million kg
export const MIN_PRICE = 0;
export const MAX_PRICE = 100000; // 100,000 FCFA per kg
export const MIN_COST = 0;
export const MAX_COST = 10000000; // 10 million FCFA

