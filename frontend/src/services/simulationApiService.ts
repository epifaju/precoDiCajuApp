// API service for Revenue Simulator backend communication
import { Simulation, CreateSimulationRequest, SimulationResponse } from '../types/simulation';
import { apiClient } from './apiClient';

class SimulationApiService {
  private baseUrl = '/api/simulations';

  /**
   * Create a new simulation
   */
  async createSimulation(request: CreateSimulationRequest): Promise<SimulationResponse> {
    const response = await apiClient.post<SimulationResponse>(this.baseUrl, request);
    return response.data;
  }

  /**
   * Get all simulations for the current user
   */
  async getAllSimulations(): Promise<SimulationResponse[]> {
    const response = await apiClient.get<SimulationResponse[]>(this.baseUrl);
    return response.data;
  }

  /**
   * Get simulation by ID
   */
  async getSimulationById(id: string): Promise<SimulationResponse> {
    const response = await apiClient.get<SimulationResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Delete simulation by ID
   */
  async deleteSimulation(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Convert API response to Simulation type
   */
  apiResponseToSimulation(response: SimulationResponse): Simulation {
    return {
      id: response.id,
      userId: response.userId,
      inputs: {
        quantity: response.quantity,
        pricePerKg: response.pricePerKg,
        transportCosts: response.transportCosts,
        otherCosts: response.otherCosts,
      },
      results: {
        grossRevenue: response.grossRevenue,
        totalExpenses: response.totalExpenses,
        netRevenue: response.netRevenue,
      },
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      isOffline: false,
    };
  }

  /**
   * Convert Simulation to API request
   */
  simulationToApiRequest(simulation: Simulation): CreateSimulationRequest {
    return {
      quantity: simulation.inputs.quantity,
      pricePerKg: simulation.inputs.pricePerKg,
      transportCosts: simulation.inputs.transportCosts,
      otherCosts: simulation.inputs.otherCosts,
    };
  }
}

// Export singleton instance
export const simulationApiService = new SimulationApiService();

