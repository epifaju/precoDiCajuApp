package gw.precaju.controller;

import gw.precaju.dto.GpsAnalysisDTO;
import gw.precaju.dto.GpsGeocodingDTO;
import gw.precaju.dto.GpsValidationDTO;
import gw.precaju.dto.request.CreatePriceRequest;
import gw.precaju.service.GpsAnalysisService;
import gw.precaju.service.GpsGeocodingService;
import gw.precaju.service.GpsValidationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur pour les fonctionnalités GPS et de géolocalisation
 */
@RestController
@RequestMapping("/api/gps")
@CrossOrigin(origins = "*")
public class GpsController {

    private static final Logger logger = LoggerFactory.getLogger(GpsController.class);

    @Autowired
    private GpsValidationService gpsValidationService;

    @Autowired
    private GpsGeocodingService gpsGeocodingService;

    @Autowired
    private GpsAnalysisService gpsAnalysisService;

    /**
     * Valide les coordonnées GPS
     */
    @PostMapping("/validate")
    public ResponseEntity<GpsValidationDTO> validateGpsCoordinates(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(required = false) BigDecimal accuracy,
            @RequestParam(required = false) String regionCode) {

        logger.info("Validating GPS coordinates: lat={}, lng={}, accuracy={}, region={}",
                latitude, longitude, accuracy, regionCode);

        try {
            GpsValidationService.GpsValidationResult result = gpsValidationService.validateGpsCoordinates(latitude,
                    longitude, accuracy, regionCode);

            GpsValidationDTO dto = convertToValidationDTO(result);

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            logger.error("Error validating GPS coordinates", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Valide les coordonnées GPS d'un prix
     */
    @PostMapping("/validate-price")
    public ResponseEntity<GpsValidationDTO> validatePriceGps(@Valid @RequestBody CreatePriceRequest request) {
        logger.info("Validating GPS coordinates for price in region: {}", request.getRegionCode());

        try {
            GpsValidationService.GpsValidationResult result = gpsValidationService.validatePriceGps(request);

            GpsValidationDTO dto = convertToValidationDTO(result);

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            logger.error("Error validating price GPS coordinates", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Effectue un géocodage inverse
     */
    @GetMapping("/geocode")
    public ResponseEntity<GpsGeocodingDTO> reverseGeocode(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude) {

        logger.info("Performing reverse geocoding for coordinates: lat={}, lng={}", latitude, longitude);

        try {
            GpsGeocodingService.GeocodingResult result = gpsGeocodingService.reverseGeocode(latitude, longitude);

            GpsGeocodingDTO dto = convertToGeocodingDTO(result);

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            logger.error("Error performing reverse geocoding", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Trouve les prix les plus proches d'une position
     */
    @GetMapping("/nearby-prices")
    public ResponseEntity<List<GpsAnalysisDTO.NearbyPriceDTO>> findNearbyPrices(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(defaultValue = "10") BigDecimal radiusKm,
            @RequestParam(defaultValue = "20") int maxResults) {

        logger.info("Finding nearby prices for coordinates: lat={}, lng={}, radius={}km, maxResults={}",
                latitude, longitude, radiusKm, maxResults);

        try {
            List<GpsAnalysisService.NearbyPrice> nearbyPrices = gpsAnalysisService.findNearbyPrices(latitude, longitude,
                    radiusKm, maxResults);

            List<GpsAnalysisDTO.NearbyPriceDTO> dtos = nearbyPrices.stream()
                    .map(this::convertToNearbyPriceDTO)
                    .toList();

            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            logger.error("Error finding nearby prices", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Analyse les données GPS d'une région
     */
    @GetMapping("/analyze-region")
    public ResponseEntity<GpsAnalysisDTO> analyzeRegionGps(
            @RequestParam String regionCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        logger.info("Analyzing GPS data for region: {} from {} to {}", regionCode, fromDate, toDate);

        try {
            GpsAnalysisService.RegionGpsAnalysis analysis = gpsAnalysisService.analyzeRegionGps(regionCode, fromDate,
                    toDate);

            GpsAnalysisDTO dto = convertToAnalysisDTO(analysis);

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            logger.error("Error analyzing region GPS data", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Calcule les statistiques de densité GPS
     */
    @GetMapping("/density-stats")
    public ResponseEntity<GpsAnalysisDTO.GpsDensityStatsDTO> calculateGpsDensity(
            @RequestParam String regionCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        logger.info("Calculating GPS density for region: {}", regionCode);

        try {
            GpsAnalysisService.GpsDensityStats stats = gpsAnalysisService.calculateGpsDensity(regionCode, fromDate,
                    toDate);

            GpsAnalysisDTO.GpsDensityStatsDTO dto = convertToDensityStatsDTO(stats);

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            logger.error("Error calculating GPS density", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtient les statistiques du cache de géocodage
     */
    @GetMapping("/geocoding-cache/stats")
    public ResponseEntity<Map<String, Object>> getGeocodingCacheStats() {
        logger.info("Getting geocoding cache statistics");

        try {
            Map<String, Object> stats = gpsGeocodingService.getCacheStats();
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            logger.error("Error getting geocoding cache stats", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Vide le cache de géocodage
     */
    @PostMapping("/geocoding-cache/clear")
    public ResponseEntity<Map<String, String>> clearGeocodingCache() {
        logger.info("Clearing geocoding cache");

        try {
            gpsGeocodingService.clearCache();

            Map<String, String> response = new HashMap<>();
            response.put("message", "Geocoding cache cleared successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error clearing geocoding cache", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Calcule la distance entre deux points GPS
     */
    @GetMapping("/distance")
    public ResponseEntity<Map<String, Object>> calculateDistance(
            @RequestParam BigDecimal lat1,
            @RequestParam BigDecimal lng1,
            @RequestParam BigDecimal lat2,
            @RequestParam BigDecimal lng2) {

        logger.info("Calculating distance between points: ({}, {}) and ({}, {})",
                lat1, lng1, lat2, lng2);

        try {
            // Utiliser le service d'analyse pour calculer la distance
            BigDecimal distance = calculateDistanceBetweenPoints(lat1, lng1, lat2, lng2);

            Map<String, Object> response = new HashMap<>();
            response.put("distanceMeters", distance);
            response.put("distanceKm", distance.divide(new BigDecimal("1000"), 3, RoundingMode.HALF_UP));
            response.put("point1", Map.of("lat", lat1, "lng", lng1));
            response.put("point2", Map.of("lat", lat2, "lng", lng2));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error calculating distance", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Méthodes de conversion

    private GpsValidationDTO convertToValidationDTO(GpsValidationService.GpsValidationResult result) {
        GpsValidationDTO dto = new GpsValidationDTO();
        dto.setLatitude(result.getLatitude());
        dto.setLongitude(result.getLongitude());
        dto.setAccuracy(result.getAccuracy());
        dto.setRegionCode(result.getRegionCode());
        dto.setValid(result.isValid());
        dto.setAccuracyLevel(result.getAccuracyLevel() != null ? result.getAccuracyLevel().name() : null);
        dto.setQualityScore(result.getQualityScore());
        dto.setErrors(result.getErrors());
        dto.setWarnings(result.getWarnings());

        if (result.getRegionConsistency() != null) {
            GpsValidationDTO.RegionConsistencyDTO consistencyDTO = new GpsValidationDTO.RegionConsistencyDTO();
            consistencyDTO.setConsistent(result.getRegionConsistency().isConsistent());
            consistencyDTO.setReason(result.getRegionConsistency().getReason());
            consistencyDTO.setDistanceFromRegion(result.getRegionConsistency().getDistanceFromRegion());
            consistencyDTO.setRegionCenterLat(result.getRegionConsistency().getRegionCenterLat());
            consistencyDTO.setRegionCenterLng(result.getRegionConsistency().getRegionCenterLng());
            dto.setRegionConsistency(consistencyDTO);
        }

        if (result.getPlausibility() != null) {
            GpsValidationDTO.PlausibilityDTO plausibilityDTO = new GpsValidationDTO.PlausibilityDTO();
            plausibilityDTO.setPlausible(result.getPlausibility().isPlausible());
            plausibilityDTO.setReason(result.getPlausibility().getReason());
            dto.setPlausibility(plausibilityDTO);
        }

        return dto;
    }

    private GpsGeocodingDTO convertToGeocodingDTO(GpsGeocodingService.GeocodingResult result) {
        GpsGeocodingDTO dto = new GpsGeocodingDTO();
        dto.setLatitude(result.getLatitude());
        dto.setLongitude(result.getLongitude());
        dto.setSuccess(result.isSuccess());
        dto.setErrorMessage(result.getErrorMessage());
        dto.setDisplayName(result.getDisplayName());
        dto.setFormattedAddress(result.getFormattedAddress());
        dto.setCountry(result.getCountry());
        dto.setState(result.getState());
        dto.setCounty(result.getCounty());
        dto.setCity(result.getCity());
        dto.setTown(result.getTown());
        dto.setVillage(result.getVillage());
        dto.setHamlet(result.getHamlet());
        dto.setSuburb(result.getSuburb());
        dto.setRoad(result.getRoad());
        dto.setHouseNumber(result.getHouseNumber());
        dto.setPostcode(result.getPostcode());
        dto.setPlaceType(result.getPlaceType());
        dto.setPlaceClass(result.getPlaceClass());
        dto.setImportance(result.getImportance());

        return dto;
    }

    private GpsAnalysisDTO convertToAnalysisDTO(GpsAnalysisService.RegionGpsAnalysis analysis) {
        GpsAnalysisDTO dto = new GpsAnalysisDTO();
        dto.setRegionCode(analysis.getRegionCode());
        dto.setFromDate(analysis.getFromDate());
        dto.setToDate(analysis.getToDate());
        dto.setTotalPrices(analysis.getTotalPrices());
        dto.setPricesWithGps(analysis.getPricesWithGps());
        dto.setGpsCoveragePercentage(analysis.getGpsCoveragePercentage());
        dto.setGeographicCenterLat(analysis.getGeographicCenterLat());
        dto.setGeographicCenterLng(analysis.getGeographicCenterLng());
        dto.setMinLatitude(analysis.getMinLatitude());
        dto.setMaxLatitude(analysis.getMaxLatitude());
        dto.setMinLongitude(analysis.getMinLongitude());
        dto.setMaxLongitude(analysis.getMaxLongitude());
        dto.setMaxDistanceFromCenter(analysis.getMaxDistanceFromCenter());
        dto.setClusterCount(analysis.getClusterCount());
        dto.setValidGpsCount(analysis.getValidGpsCount());
        dto.setInvalidGpsCount(analysis.getInvalidGpsCount());
        dto.setGpsQualityPercentage(analysis.getGpsQualityPercentage());
        dto.setAverageQualityScore(analysis.getAverageQualityScore());
        dto.setAverageDistanceBetweenPoints(analysis.getAverageDistanceBetweenPoints());

        // Convertir les clusters
        if (analysis.getClusters() != null) {
            List<GpsAnalysisDTO.GpsClusterDTO> clusterDTOs = analysis.getClusters().stream()
                    .map(this::convertToClusterDTO)
                    .toList();
            dto.setClusters(clusterDTOs);
        }

        return dto;
    }

    private GpsAnalysisDTO.GpsClusterDTO convertToClusterDTO(GpsAnalysisService.GpsCluster cluster) {
        GpsAnalysisDTO.GpsClusterDTO dto = new GpsAnalysisDTO.GpsClusterDTO();
        dto.setPriceCount(cluster.getPriceCount());
        dto.setCenterLat(cluster.getCenterLat());
        dto.setCenterLng(cluster.getCenterLng());
        dto.setRadius(cluster.getRadius());
        // Note: Les prix individuels ne sont pas convertis pour éviter la récursion
        return dto;
    }

    private GpsAnalysisDTO.NearbyPriceDTO convertToNearbyPriceDTO(GpsAnalysisService.NearbyPrice nearbyPrice) {
        // Note: PriceDTO conversion serait nécessaire ici
        GpsAnalysisDTO.NearbyPriceDTO dto = new GpsAnalysisDTO.NearbyPriceDTO();
        dto.setDistanceKm(nearbyPrice.getDistanceKm());
        // dto.setPrice(priceMapper.toDTO(nearbyPrice.getPrice())); // Nécessiterait le
        // mapper
        return dto;
    }

    private GpsAnalysisDTO.GpsDensityStatsDTO convertToDensityStatsDTO(GpsAnalysisService.GpsDensityStats stats) {
        return new GpsAnalysisDTO.GpsDensityStatsDTO(
                stats.getRegionCode(),
                stats.getPointCount(),
                stats.getAreaKm2(),
                stats.getDensity(),
                stats.getAverageDistance());
    }

    private BigDecimal calculateDistanceBetweenPoints(BigDecimal lat1, BigDecimal lng1,
            BigDecimal lat2, BigDecimal lng2) {
        final double EARTH_RADIUS = 6371000.0; // Rayon de la Terre en mètres

        double lat1Rad = Math.toRadians(lat1.doubleValue());
        double lng1Rad = Math.toRadians(lng1.doubleValue());
        double lat2Rad = Math.toRadians(lat2.doubleValue());
        double lng2Rad = Math.toRadians(lng2.doubleValue());

        double dLat = lat2Rad - lat1Rad;
        double dLng = lng2Rad - lng1Rad;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return new BigDecimal(EARTH_RADIUS * c).setScale(2, RoundingMode.HALF_UP);
    }
}
