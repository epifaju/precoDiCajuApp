// Utility functions for Revenue Simulator calculations
import { SimulationInput, SimulationResult, SimulationFormData, SimulationValidationErrors } from '../types/simulation';

/**
 * Calculate simulation results based on inputs
 */
export const calculateSimulationResults = (inputs: SimulationInput): SimulationResult => {
  const grossRevenue = inputs.quantity * inputs.pricePerKg;
  const totalExpenses = inputs.transportCosts + inputs.otherCosts;
  const netRevenue = grossRevenue - totalExpenses;

  return {
    grossRevenue: Math.round(grossRevenue * 100) / 100, // Round to 2 decimal places
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
  };
};

/**
 * Convert form data to simulation input
 */
export const formDataToSimulationInput = (formData: SimulationFormData): SimulationInput => {
  return {
    quantity: parseFloat(formData.quantity) || 0,
    pricePerKg: parseFloat(formData.pricePerKg) || 0,
    transportCosts: parseFloat(formData.transportCosts) || 0,
    otherCosts: parseFloat(formData.otherCosts) || 0,
  };
};

/**
 * Convert simulation input to form data
 */
export const simulationInputToFormData = (inputs: SimulationInput): SimulationFormData => {
  return {
    quantity: inputs.quantity.toString(),
    pricePerKg: inputs.pricePerKg.toString(),
    transportCosts: inputs.transportCosts.toString(),
    otherCosts: inputs.otherCosts.toString(),
  };
};

/**
 * Validate simulation form data
 */
export const validateSimulationForm = (formData: SimulationFormData): SimulationValidationErrors => {
  const errors: SimulationValidationErrors = {};

  // Validate quantity
  const quantity = parseFloat(formData.quantity);
  if (isNaN(quantity) || quantity < 0) {
    errors.quantity = 'Quantidade deve ser um número positivo';
  } else if (quantity > 1000000) {
    errors.quantity = 'Quantidade não pode exceder 1.000.000 kg';
  }

  // Validate price per kg
  const pricePerKg = parseFloat(formData.pricePerKg);
  if (isNaN(pricePerKg) || pricePerKg < 0) {
    errors.pricePerKg = 'Preço por kg deve ser um número positivo';
  } else if (pricePerKg > 100000) {
    errors.pricePerKg = 'Preço por kg não pode exceder 100.000 FCFA';
  }

  // Validate transport costs
  const transportCosts = parseFloat(formData.transportCosts);
  if (isNaN(transportCosts) || transportCosts < 0) {
    errors.transportCosts = 'Custos de transporte devem ser um número positivo';
  } else if (transportCosts > 10000000) {
    errors.transportCosts = 'Custos de transporte não podem exceder 10.000.000 FCFA';
  }

  // Validate other costs
  const otherCosts = parseFloat(formData.otherCosts);
  if (isNaN(otherCosts) || otherCosts < 0) {
    errors.otherCosts = 'Outros custos devem ser um número positivo';
  } else if (otherCosts > 10000000) {
    errors.otherCosts = 'Outros custos não podem exceder 10.000.000 FCFA';
  }

  return errors;
};

/**
 * Check if form data is valid
 */
export const isFormValid = (formData: SimulationFormData): boolean => {
  const errors = validateSimulationForm(formData);
  return Object.keys(errors).length === 0;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'XOF', // West African CFA franc
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number for display
 */
export const formatNumber = (number: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Get color class for net revenue display
 */
export const getNetRevenueColorClass = (netRevenue: number): string => {
  if (netRevenue > 0) {
    return 'text-green-600 dark:text-green-400';
  } else if (netRevenue < 0) {
    return 'text-red-600 dark:text-red-400';
  } else {
    return 'text-gray-600 dark:text-gray-400';
  }
};

/**
 * Get background color class for net revenue display
 */
export const getNetRevenueBgClass = (netRevenue: number): string => {
  if (netRevenue > 0) {
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  } else if (netRevenue < 0) {
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  } else {
    return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }
};

/**
 * Calculate profit margin percentage
 */
export const calculateProfitMargin = (grossRevenue: number, netRevenue: number): number => {
  if (grossRevenue === 0) return 0;
  return Math.round((netRevenue / grossRevenue) * 100 * 100) / 100; // Round to 2 decimal places
};

/**
 * Get profit margin color class
 */
export const getProfitMarginColorClass = (margin: number): string => {
  if (margin > 20) {
    return 'text-green-600 dark:text-green-400';
  } else if (margin > 10) {
    return 'text-yellow-600 dark:text-yellow-400';
  } else if (margin > 0) {
    return 'text-orange-600 dark:text-orange-400';
  } else {
    return 'text-red-600 dark:text-red-400';
  }
};

