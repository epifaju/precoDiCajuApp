package gw.precaju.controller;

import gw.precaju.dto.POIDTO;
import gw.precaju.dto.POIStatisticsDTO;
import gw.precaju.dto.request.CreatePOIRequest;
import gw.precaju.dto.request.UpdatePOIRequest;
import gw.precaju.entity.POIType;
import gw.precaju.service.POIService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/poi")
public class POIController {

    private static final Logger logger = LoggerFactory.getLogger(POIController.class);

    private final POIService poiService;

    public POIController(POIService poiService) {
        this.poiService = poiService;
    }

    /**
     * Get all POIs with optional filtering
     * 
     * Query parameters:
     * - type: Filter by POI type (acheteur, cooperative, entrepot)
     * - search: Search in POI names
     * - minLat, maxLat, minLng, maxLng: Bounding box filtering
     * - lat, lng, radius: Radius-based filtering (radius in km)
     */
    @GetMapping
    public ResponseEntity<List<POIDTO>> getPOIs(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minLat,
            @RequestParam(required = false) BigDecimal maxLat,
            @RequestParam(required = false) BigDecimal minLng,
            @RequestParam(required = false) BigDecimal maxLng,
            @RequestParam(required = false) BigDecimal lat,
            @RequestParam(required = false) BigDecimal lng,
            @RequestParam(required = false) Double radius) {

        try {
            logger.debug(
                    "Received request for POIs - type: {}, search: {}, bounds: [{},{}] to [{},{}], center: [{},{}], radius: {}km",
                    type, search, minLat, minLng, maxLat, maxLng, lat, lng, radius);

            // Parse and validate POI type
            POIType poiType = null;
            if (type != null && !type.trim().isEmpty()) {
                try {
                    poiType = POIType.fromCode(type.trim());
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid POI type: {}", type);
                    return ResponseEntity.badRequest().build();
                }
            }

            // Validate radius parameter
            if (radius != null && radius <= 0) {
                logger.warn("Invalid radius: {}", radius);
                return ResponseEntity.badRequest().build();
            }

            // Validate coordinates for radius search
            if (radius != null && (lat == null || lng == null)) {
                logger.warn("Radius specified but latitude or longitude missing");
                return ResponseEntity.badRequest().build();
            }

            List<POIDTO> pois = poiService.getAllPOIs(poiType, search, minLat, maxLat,
                    minLng, maxLng, lat, lng, radius);

            logger.info("Successfully retrieved {} POIs", pois.size());
            return ResponseEntity.ok(pois);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error retrieving POIs - detailed error info:", e);
            logger.error("Error class: {}", e.getClass().getSimpleName());
            logger.error("Error message: {}", e.getMessage());
            if (e.getCause() != null) {
                logger.error("Caused by: {} - {}", e.getCause().getClass().getSimpleName(), e.getCause().getMessage());
            }

            // Return detailed error response for debugging
            String errorMessage = "Internal server error: " + e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " (Caused by: " + e.getCause().getMessage() + ")";
            }

            // For debugging purposes, we'll return the error as a simple response
            // In production, you might want to create a proper error DTO
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get POI by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<POIDTO> getPOIById(@PathVariable UUID id) {
        try {
            logger.debug("Getting POI by ID: {}", id);

            return poiService.getPOIById(id)
                    .map(poi -> {
                        logger.info("Successfully retrieved POI: {}", id);
                        return ResponseEntity.ok(poi);
                    })
                    .orElse(ResponseEntity.notFound().build());

        } catch (Exception e) {
            logger.error("Error retrieving POI with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get POI statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<POIStatisticsDTO> getPOIStatistics() {
        try {
            logger.debug("Getting POI statistics");

            POIStatisticsDTO stats = poiService.getPOIStatistics();
            logger.info("Successfully retrieved POI statistics");

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            logger.error("Error retrieving POI statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get POIs with phone numbers
     */
    @GetMapping("/with-phone")
    public ResponseEntity<List<POIDTO>> getPOIsWithPhone() {
        try {
            logger.debug("Getting POIs with phone numbers");

            List<POIDTO> poisWithPhone = poiService.getPOIsWithPhone();
            logger.info("Successfully retrieved {} POIs with phone numbers", poisWithPhone.size());

            return ResponseEntity.ok(poisWithPhone);

        } catch (Exception e) {
            logger.error("Error retrieving POIs with phone numbers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new POI (requires authentication)
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<POIDTO> createPOI(@Valid @RequestBody CreatePOIRequest request, Principal principal) {
        try {
            logger.debug("Creating new POI: {}", request);

            String username = principal.getName();
            POIDTO createdPOI = poiService.createPOI(request, username);

            logger.info("Successfully created POI with ID: {}", createdPOI.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPOI);

        } catch (IllegalArgumentException e) {
            logger.warn("Validation error creating POI: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error creating POI", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing POI (requires authentication)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<POIDTO> updatePOI(@PathVariable UUID id,
            @Valid @RequestBody UpdatePOIRequest request,
            Principal principal) {
        try {
            logger.debug("Updating POI {}: {}", id, request);

            String username = principal.getName();
            POIDTO updatedPOI = poiService.updatePOI(id, request, username);

            logger.info("Successfully updated POI with ID: {}", id);
            return ResponseEntity.ok(updatedPOI);

        } catch (IllegalArgumentException e) {
            logger.warn("Validation error updating POI: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error updating POI with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a POI (requires authentication)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deletePOI(@PathVariable UUID id, Principal principal) {
        try {
            logger.debug("Deleting POI: {}", id);

            poiService.deletePOI(id);

            logger.info("Successfully deleted POI with ID: {}", id);
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            logger.warn("POI not found for deletion: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting POI with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint for POI service
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("POI service is healthy");
    }
}