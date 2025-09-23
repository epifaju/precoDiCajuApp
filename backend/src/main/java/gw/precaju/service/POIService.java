package gw.precaju.service;

import gw.precaju.dto.POIDTO;
import gw.precaju.dto.POIStatisticsDTO;
import gw.precaju.dto.request.CreatePOIRequest;
import gw.precaju.dto.request.UpdatePOIRequest;
import gw.precaju.entity.POI;
import gw.precaju.entity.POIType;
import gw.precaju.mapper.POIMapper;
import gw.precaju.repository.POIRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class POIService {

    private static final Logger logger = LoggerFactory.getLogger(POIService.class);

    private final POIRepository poiRepository;
    private final POIMapper poiMapper;

    public POIService(POIRepository poiRepository, POIMapper poiMapper) {
        this.poiRepository = poiRepository;
        this.poiMapper = poiMapper;
    }

    /**
     * Get all active POIs with optional filtering
     */
    @Transactional(readOnly = true)
    public List<POIDTO> getAllPOIs(POIType type, String search, BigDecimal minLat, BigDecimal maxLat,
            BigDecimal minLng, BigDecimal maxLng, BigDecimal lat,
            BigDecimal lng, Double radiusKm) {
        logger.debug("Getting POIs with filters - type: {}, search: {}, bounds: [{},{}] to [{},{}], radius: {}km",
                type, search, minLat, minLng, maxLat, maxLng, radiusKm);

        List<POI> pois;

        try {
            // Priority order for filtering:
            // 1. Radius search (if lat, lng and radius provided)
            // 2. Bounding box search (if bounds provided)
            // 3. Type and/or search filtering
            // 4. All active POIs

            if (lat != null && lng != null && radiusKm != null && radiusKm > 0) {
                logger.debug("Using radius search: lat={}, lng={}, radius={}km", lat, lng, radiusKm);
                pois = poiRepository.findPOIsWithinRadius(lat, lng, radiusKm);

                // Apply additional filters if needed
                if (type != null) {
                    pois = pois.stream()
                            .filter(poi -> poi.getType() == type)
                            .collect(Collectors.toList());
                }
                if (search != null && !search.trim().isEmpty()) {
                    String searchLower = search.toLowerCase().trim();
                    pois = pois.stream()
                            .filter(poi -> poi.getNom().toLowerCase().contains(searchLower))
                            .collect(Collectors.toList());
                }
            } else if (minLat != null && maxLat != null && minLng != null && maxLng != null) {
                logger.debug("Using bounding box search");
                if (type != null) {
                    pois = poiRepository.findPOIsInBoundsByType(type, minLat, maxLat, minLng, maxLng);
                } else {
                    pois = poiRepository.findPOIsInBounds(minLat, maxLat, minLng, maxLng);
                }

                // Apply search filter if needed
                if (search != null && !search.trim().isEmpty()) {
                    String searchLower = search.toLowerCase().trim();
                    pois = pois.stream()
                            .filter(poi -> poi.getNom().toLowerCase().contains(searchLower))
                            .collect(Collectors.toList());
                }
            } else if (search != null && !search.trim().isEmpty()) {
                logger.debug("Using search filter");
                if (type != null) {
                    pois = poiRepository.findByTypeAndNomContainingIgnoreCaseAndActiveTrue(type, search.trim());
                } else {
                    pois = poiRepository.findByNomContainingIgnoreCaseAndActiveTrue(search.trim());
                }
            } else if (type != null) {
                logger.debug("Using type filter: {}", type);
                pois = poiRepository.findByTypeActiveTrueOrderByNom(type);
            } else {
                logger.debug("Getting all active POIs");
                pois = poiRepository.findByActiveTrueOrderByNom();
            }

            logger.info("Found {} POIs matching criteria", pois.size());
            return pois.stream()
                    .map(poiMapper::toDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error(
                    "Error retrieving POIs with filters - type: {}, search: {}, bounds: [{},{}] to [{},{}], radius: {}km",
                    type, search, minLat, minLng, maxLat, maxLng, radiusKm, e);
            throw new RuntimeException("Failed to retrieve POIs: " + e.getMessage(), e);
        }
    }

    /**
     * Get POI by ID
     */
    @Transactional(readOnly = true)
    public Optional<POIDTO> getPOIById(UUID id) {
        logger.debug("Getting POI by ID: {}", id);

        try {
            return poiRepository.findByIdAndActiveTrue(id)
                    .map(poiMapper::toDTO);
        } catch (Exception e) {
            logger.error("Error retrieving POI with ID: {}", id, e);
            throw new RuntimeException("Failed to retrieve POI", e);
        }
    }

    /**
     * Create a new POI
     */
    public POIDTO createPOI(CreatePOIRequest request, String createdBy) {
        logger.debug("Creating new POI: {}", request);

        try {
            // Validate coordinates are within Guinea-Bissau bounds
            if (!isWithinGuineaBissauBounds(request.getLatitude(), request.getLongitude())) {
                throw new IllegalArgumentException("Coordinates must be within Guinea-Bissau bounds");
            }

            // Check for duplicate name
            if (poiRepository.existsByNomAndActiveTrue(request.getNom())) {
                throw new IllegalArgumentException("POI with this name already exists");
            }

            // Check for nearby POIs (within 100 meters)
            List<POI> nearbyPOIs = poiRepository.findByCoordinatesApproximate(
                    BigDecimal.valueOf(request.getLatitude()),
                    BigDecimal.valueOf(request.getLongitude()));
            if (!nearbyPOIs.isEmpty()) {
                logger.warn("POI created near existing POI(s): {}", nearbyPOIs.size());
            }

            POI poi = poiMapper.toEntity(request);
            poi.setCreatedBy(createdBy);
            poi.setActive(true);

            POI savedPOI = poiRepository.save(poi);
            logger.info("Created POI with ID: {}", savedPOI.getId());

            return poiMapper.toDTO(savedPOI);

        } catch (IllegalArgumentException e) {
            logger.warn("Validation error creating POI: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error creating POI", e);
            throw new RuntimeException("Failed to create POI", e);
        }
    }

    /**
     * Update an existing POI
     */
    public POIDTO updatePOI(UUID id, UpdatePOIRequest request, String updatedBy) {
        logger.debug("Updating POI {}: {}", id, request);

        try {
            POI existingPOI = poiRepository.findByIdAndActiveTrue(id)
                    .orElseThrow(() -> new IllegalArgumentException("POI not found"));

            // Validate coordinates if provided
            if (request.getLatitude() != null && request.getLongitude() != null) {
                if (!isWithinGuineaBissauBounds(request.getLatitude(), request.getLongitude())) {
                    throw new IllegalArgumentException("Coordinates must be within Guinea-Bissau bounds");
                }
            }

            // Check for duplicate name if name is being changed
            if (request.getNom() != null && !request.getNom().equals(existingPOI.getNom())) {
                if (poiRepository.existsByNomAndActiveTrueAndIdNot(request.getNom(), id)) {
                    throw new IllegalArgumentException("POI with this name already exists");
                }
            }

            // Update fields
            poiMapper.updateEntityFromRequest(request, existingPOI);

            POI updatedPOI = poiRepository.save(existingPOI);
            logger.info("Updated POI with ID: {}", updatedPOI.getId());

            return poiMapper.toDTO(updatedPOI);

        } catch (IllegalArgumentException e) {
            logger.warn("Validation error updating POI: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error updating POI with ID: {}", id, e);
            throw new RuntimeException("Failed to update POI", e);
        }
    }

    /**
     * Soft delete a POI
     */
    public void deletePOI(UUID id) {
        logger.debug("Deleting POI: {}", id);

        try {
            POI poi = poiRepository.findByIdAndActiveTrue(id)
                    .orElseThrow(() -> new IllegalArgumentException("POI not found"));

            poi.setActive(false);
            poiRepository.save(poi);

            logger.info("Deleted POI with ID: {}", id);

        } catch (IllegalArgumentException e) {
            logger.warn("POI not found for deletion: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting POI with ID: {}", id, e);
            throw new RuntimeException("Failed to delete POI", e);
        }
    }

    /**
     * Get POI statistics
     */
    @Transactional(readOnly = true)
    public POIStatisticsDTO getPOIStatistics() {
        logger.debug("Getting POI statistics");

        try {
            Long totalCount = poiRepository.countActivePOIs();
            Long acheteurCount = poiRepository.countActivePOIsByType(POIType.ACHETEUR);
            Long cooperativeCount = poiRepository.countActivePOIsByType(POIType.COOPERATIVE);
            Long entrepotCount = poiRepository.countActivePOIsByType(POIType.ENTREPOT);

            POIStatisticsDTO stats = new POIStatisticsDTO(totalCount, acheteurCount, cooperativeCount, entrepotCount);
            logger.info("POI statistics: {}", stats);

            return stats;

        } catch (Exception e) {
            logger.error("Error getting POI statistics", e);
            throw new RuntimeException("Failed to get POI statistics", e);
        }
    }

    /**
     * Get POIs with phone numbers
     */
    @Transactional(readOnly = true)
    public List<POIDTO> getPOIsWithPhone() {
        logger.debug("Getting POIs with phone numbers");

        try {
            List<POI> poisWithPhone = poiRepository.findPOIsWithPhone();
            logger.info("Found {} POIs with phone numbers", poisWithPhone.size());

            return poisWithPhone.stream()
                    .map(poiMapper::toDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Error getting POIs with phone numbers", e);
            throw new RuntimeException("Failed to get POIs with phone numbers", e);
        }
    }

    /**
     * Validate coordinates within Guinea-Bissau bounds
     */
    private boolean isWithinGuineaBissauBounds(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return false;
        }

        // Guinea-Bissau approximate bounds
        return latitude >= 10.5 && latitude <= 12.8 &&
                longitude >= -17.0 && longitude <= -13.5;
    }
}