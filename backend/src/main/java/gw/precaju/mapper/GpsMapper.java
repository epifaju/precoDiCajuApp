package gw.precaju.mapper;

import gw.precaju.dto.GpsAnalysisDTO;
import gw.precaju.dto.GpsGeocodingDTO;
import gw.precaju.dto.GpsValidationDTO;
import gw.precaju.service.GpsAnalysisService;
import gw.precaju.service.GpsGeocodingService;
import gw.precaju.service.GpsValidationService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour les DTOs GPS
 */
@Component
public class GpsMapper {

    /**
     * Convertit un résultat de validation GPS en DTO
     */
    public GpsValidationDTO toValidationDTO(GpsValidationService.GpsValidationResult result) {
        if (result == null) {
            return null;
        }

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

        // Convertir la cohérence avec la région
        if (result.getRegionConsistency() != null) {
            GpsValidationDTO.RegionConsistencyDTO consistencyDTO = new GpsValidationDTO.RegionConsistencyDTO();
            consistencyDTO.setConsistent(result.getRegionConsistency().isConsistent());
            consistencyDTO.setReason(result.getRegionConsistency().getReason());
            consistencyDTO.setDistanceFromRegion(result.getRegionConsistency().getDistanceFromRegion());
            consistencyDTO.setRegionCenterLat(result.getRegionConsistency().getRegionCenterLat());
            consistencyDTO.setRegionCenterLng(result.getRegionConsistency().getRegionCenterLng());
            dto.setRegionConsistency(consistencyDTO);
        }

        // Convertir la plausibilité
        if (result.getPlausibility() != null) {
            GpsValidationDTO.PlausibilityDTO plausibilityDTO = new GpsValidationDTO.PlausibilityDTO();
            plausibilityDTO.setPlausible(result.getPlausibility().isPlausible());
            plausibilityDTO.setReason(result.getPlausibility().getReason());
            dto.setPlausibility(plausibilityDTO);
        }

        return dto;
    }

    /**
     * Convertit un résultat de géocodage en DTO
     */
    public GpsGeocodingDTO toGeocodingDTO(GpsGeocodingService.GeocodingResult result) {
        if (result == null) {
            return null;
        }

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

    /**
     * Convertit une analyse GPS de région en DTO
     */
    public GpsAnalysisDTO toAnalysisDTO(GpsAnalysisService.RegionGpsAnalysis analysis) {
        if (analysis == null) {
            return null;
        }

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
                    .map(this::toClusterDTO)
                    .collect(Collectors.toList());
            dto.setClusters(clusterDTOs);
        }

        return dto;
    }

    /**
     * Convertit un cluster GPS en DTO
     */
    public GpsAnalysisDTO.GpsClusterDTO toClusterDTO(GpsAnalysisService.GpsCluster cluster) {
        if (cluster == null) {
            return null;
        }

        GpsAnalysisDTO.GpsClusterDTO dto = new GpsAnalysisDTO.GpsClusterDTO();
        dto.setPriceCount(cluster.getPriceCount());
        dto.setCenterLat(cluster.getCenterLat());
        dto.setCenterLng(cluster.getCenterLng());
        dto.setRadius(cluster.getRadius());

        // Note: Les prix individuels ne sont pas convertis pour éviter la récursion
        // Si nécessaire, utiliser un mapper de prix séparé

        return dto;
    }

    /**
     * Convertit un prix proche en DTO
     */
    public GpsAnalysisDTO.NearbyPriceDTO toNearbyPriceDTO(GpsAnalysisService.NearbyPrice nearbyPrice) {
        if (nearbyPrice == null) {
            return null;
        }

        GpsAnalysisDTO.NearbyPriceDTO dto = new GpsAnalysisDTO.NearbyPriceDTO();
        dto.setDistanceKm(nearbyPrice.getDistanceKm());

        // Note: La conversion du prix nécessiterait un mapper de prix
        // dto.setPrice(priceMapper.toDTO(nearbyPrice.getPrice()));

        return dto;
    }

    /**
     * Convertit des statistiques de densité GPS en DTO
     */
    public GpsAnalysisDTO.GpsDensityStatsDTO toDensityStatsDTO(GpsAnalysisService.GpsDensityStats stats) {
        if (stats == null) {
            return null;
        }

        return new GpsAnalysisDTO.GpsDensityStatsDTO(
                stats.getRegionCode(),
                stats.getPointCount(),
                stats.getAreaKm2(),
                stats.getDensity(),
                stats.getAverageDistance());
    }

    /**
     * Convertit une liste de prix proches en DTOs
     */
    public List<GpsAnalysisDTO.NearbyPriceDTO> toNearbyPriceDTOs(List<GpsAnalysisService.NearbyPrice> nearbyPrices) {
        if (nearbyPrices == null) {
            return null;
        }

        return nearbyPrices.stream()
                .map(this::toNearbyPriceDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une liste d'analyses GPS en DTOs
     */
    public List<GpsAnalysisDTO> toAnalysisDTOs(List<GpsAnalysisService.RegionGpsAnalysis> analyses) {
        if (analyses == null) {
            return null;
        }

        return analyses.stream()
                .map(this::toAnalysisDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une liste de résultats de validation en DTOs
     */
    public List<GpsValidationDTO> toValidationDTOs(List<GpsValidationService.GpsValidationResult> results) {
        if (results == null) {
            return null;
        }

        return results.stream()
                .map(this::toValidationDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une liste de résultats de géocodage en DTOs
     */
    public List<GpsGeocodingDTO> toGeocodingDTOs(List<GpsGeocodingService.GeocodingResult> results) {
        if (results == null) {
            return null;
        }

        return results.stream()
                .map(this::toGeocodingDTO)
                .collect(Collectors.toList());
    }
}
