package gw.precaju.service;

import gw.precaju.dto.CreateSimulationRequest;
import gw.precaju.dto.SimulationDTO;
import gw.precaju.entity.Simulation;
import gw.precaju.entity.User;
import gw.precaju.repository.SimulationRepository;
import gw.precaju.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SimulationService {

    private final SimulationRepository simulationRepository;
    private final UserRepository userRepository;

    @Autowired
    public SimulationService(SimulationRepository simulationRepository, UserRepository userRepository) {
        this.simulationRepository = simulationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new simulation for a user
     */
    public SimulationDTO createSimulation(UUID userId, CreateSimulationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Simulation simulation = new Simulation();
        simulation.setUser(user);
        simulation.setQuantity(request.getQuantity());
        simulation.setPricePerKg(request.getPricePerKg());
        simulation.setTransportCosts(request.getTransportCosts());
        simulation.setOtherCosts(request.getOtherCosts());

        Simulation savedSimulation = simulationRepository.save(simulation);
        return convertToDTO(savedSimulation);
    }

    /**
     * Get all simulations for a user
     */
    @Transactional(readOnly = true)
    public List<SimulationDTO> getAllSimulationsByUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        List<Simulation> simulations = simulationRepository.findByUserOrderByCreatedAtDesc(user);
        return simulations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get simulations for a user with pagination
     */
    @Transactional(readOnly = true)
    public Page<SimulationDTO> getSimulationsByUser(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Page<Simulation> simulations = simulationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return simulations.map(this::convertToDTO);
    }

    /**
     * Get a specific simulation by ID
     */
    @Transactional(readOnly = true)
    public SimulationDTO getSimulationById(UUID simulationId, UUID userId) {
        Simulation simulation = simulationRepository.findById(simulationId)
                .orElseThrow(() -> new IllegalArgumentException("Simulation not found with id: " + simulationId));

        // Check if the simulation belongs to the user
        if (!simulation.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Simulation does not belong to user");
        }

        return convertToDTO(simulation);
    }

    /**
     * Delete a simulation
     */
    public void deleteSimulation(UUID simulationId, UUID userId) {
        Simulation simulation = simulationRepository.findById(simulationId)
                .orElseThrow(() -> new IllegalArgumentException("Simulation not found with id: " + simulationId));

        // Check if the simulation belongs to the user
        if (!simulation.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Simulation does not belong to user");
        }

        simulationRepository.delete(simulation);
    }

    /**
     * Get simulation statistics for a user
     */
    @Transactional(readOnly = true)
    public SimulationStatsDTO getSimulationStats(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        long totalSimulations = simulationRepository.countByUser(user);
        long profitableSimulations = simulationRepository.countProfitableSimulationsByUser(user);
        BigDecimal averageNetRevenue = simulationRepository.calculateAverageNetRevenueByUser(user);
        BigDecimal totalNetRevenue = simulationRepository.calculateTotalNetRevenueByUser(user);

        return new SimulationStatsDTO(
                totalSimulations,
                profitableSimulations,
                averageNetRevenue != null ? averageNetRevenue : BigDecimal.ZERO,
                totalNetRevenue != null ? totalNetRevenue : BigDecimal.ZERO);
    }

    /**
     * Get profitable simulations for a user
     */
    @Transactional(readOnly = true)
    public List<SimulationDTO> getProfitableSimulations(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        List<Simulation> simulations = simulationRepository.findProfitableSimulationsByUser(user);
        return simulations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get loss-making simulations for a user
     */
    @Transactional(readOnly = true)
    public List<SimulationDTO> getLossMakingSimulations(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        List<Simulation> simulations = simulationRepository.findLossMakingSimulationsByUser(user);
        return simulations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert Simulation entity to DTO
     */
    private SimulationDTO convertToDTO(Simulation simulation) {
        SimulationDTO dto = new SimulationDTO();
        dto.setId(simulation.getId());
        dto.setUserId(simulation.getUser().getId());
        dto.setQuantity(simulation.getQuantity());
        dto.setPricePerKg(simulation.getPricePerKg());
        dto.setTransportCosts(simulation.getTransportCosts());
        dto.setOtherCosts(simulation.getOtherCosts());
        dto.setGrossRevenue(simulation.getGrossRevenue());
        dto.setTotalExpenses(simulation.getTotalExpenses());
        dto.setNetRevenue(simulation.getNetRevenue());
        dto.setCreatedAt(simulation.getCreatedAt());
        dto.setUpdatedAt(simulation.getUpdatedAt());
        return dto;
    }

    /**
     * DTO for simulation statistics
     */
    public static class SimulationStatsDTO {
        private final long totalSimulations;
        private final long profitableSimulations;
        private final BigDecimal averageNetRevenue;
        private final BigDecimal totalNetRevenue;

        public SimulationStatsDTO(long totalSimulations, long profitableSimulations,
                BigDecimal averageNetRevenue, BigDecimal totalNetRevenue) {
            this.totalSimulations = totalSimulations;
            this.profitableSimulations = profitableSimulations;
            this.averageNetRevenue = averageNetRevenue;
            this.totalNetRevenue = totalNetRevenue;
        }

        public long getTotalSimulations() {
            return totalSimulations;
        }

        public long getProfitableSimulations() {
            return profitableSimulations;
        }

        public BigDecimal getAverageNetRevenue() {
            return averageNetRevenue;
        }

        public BigDecimal getTotalNetRevenue() {
            return totalNetRevenue;
        }

        public BigDecimal getProfitabilityPercentage() {
            if (totalSimulations == 0) {
                return BigDecimal.ZERO;
            }
            return BigDecimal.valueOf(profitableSimulations)
                    .divide(BigDecimal.valueOf(totalSimulations), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
    }
}
