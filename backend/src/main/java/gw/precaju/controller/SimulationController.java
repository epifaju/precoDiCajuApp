package gw.precaju.controller;

import gw.precaju.dto.CreateSimulationRequest;
import gw.precaju.dto.SimulationDTO;
import gw.precaju.service.SimulationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/simulations")
@CrossOrigin(origins = "*")
public class SimulationController {

    private final SimulationService simulationService;

    @Autowired
    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Create a new simulation
     */
    @PostMapping
    public ResponseEntity<SimulationDTO> createSimulation(
            @Valid @RequestBody CreateSimulationRequest request,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());
        SimulationDTO simulation = simulationService.createSimulation(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(simulation);
    }

    /**
     * Get all simulations for the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<SimulationDTO>> getAllSimulations(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<SimulationDTO> simulations = simulationService.getAllSimulationsByUser(userId);

        return ResponseEntity.ok(simulations);
    }

    /**
     * Get simulations with pagination
     */
    @GetMapping("/paginated")
    public ResponseEntity<Page<SimulationDTO>> getSimulations(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());
        Page<SimulationDTO> simulations = simulationService.getSimulationsByUser(userId, pageable);

        return ResponseEntity.ok(simulations);
    }

    /**
     * Get a specific simulation by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SimulationDTO> getSimulation(
            @PathVariable UUID id,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());
        SimulationDTO simulation = simulationService.getSimulationById(id, userId);

        return ResponseEntity.ok(simulation);
    }

    /**
     * Delete a simulation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSimulation(
            @PathVariable UUID id,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());
        simulationService.deleteSimulation(id, userId);

        return ResponseEntity.noContent().build();
    }

    /**
     * Get simulation statistics for the authenticated user
     */
    @GetMapping("/stats")
    public ResponseEntity<SimulationService.SimulationStatsDTO> getSimulationStats(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        SimulationService.SimulationStatsDTO stats = simulationService.getSimulationStats(userId);

        return ResponseEntity.ok(stats);
    }

    /**
     * Get profitable simulations for the authenticated user
     */
    @GetMapping("/profitable")
    public ResponseEntity<List<SimulationDTO>> getProfitableSimulations(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<SimulationDTO> simulations = simulationService.getProfitableSimulations(userId);

        return ResponseEntity.ok(simulations);
    }

    /**
     * Get loss-making simulations for the authenticated user
     */
    @GetMapping("/loss-making")
    public ResponseEntity<List<SimulationDTO>> getLossMakingSimulations(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<SimulationDTO> simulations = simulationService.getLossMakingSimulations(userId);

        return ResponseEntity.ok(simulations);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Simulation service is running");
    }
}

