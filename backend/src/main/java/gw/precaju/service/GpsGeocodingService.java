package gw.precaju.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service de géocodage inverse pour les coordonnées GPS
 * Utilise OpenStreetMap Nominatim pour obtenir des informations d'adresse
 */
@Service
public class GpsGeocodingService {

    private static final Logger logger = LoggerFactory.getLogger(GpsGeocodingService.class);

    @Value("${app.geocoding.enabled:true}")
    private boolean geocodingEnabled;

    @Value("${app.geocoding.nominatim.url:https://nominatim.openstreetmap.org/reverse}")
    private String nominatimUrl;

    @Value("${app.geocoding.cache.enabled:true}")
    private boolean cacheEnabled;

    @Value("${app.geocoding.cache.size:1000}")
    private int cacheSize;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final Map<String, GeocodingResult> geocodingCache;

    public GpsGeocodingService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.geocodingCache = new ConcurrentHashMap<>();
    }

    /**
     * Effectue un géocodage inverse pour les coordonnées GPS données
     */
    public GeocodingResult reverseGeocode(BigDecimal latitude, BigDecimal longitude) {
        if (!geocodingEnabled) {
            logger.debug("Geocoding is disabled");
            return createDisabledResult();
        }

        if (latitude == null || longitude == null) {
            logger.warn("Cannot geocode null coordinates");
            return createErrorResult("Invalid coordinates");
        }

        // Vérifier le cache
        String cacheKey = createCacheKey(latitude, longitude);
        if (cacheEnabled && geocodingCache.containsKey(cacheKey)) {
            logger.debug("Returning cached geocoding result for coordinates: {}, {}", latitude, longitude);
            return geocodingCache.get(cacheKey);
        }

        try {
            logger.debug("Performing reverse geocoding for coordinates: {}, {}", latitude, longitude);

            // Construire l'URL de requête
            String url = buildNominatimUrl(latitude, longitude);

            // Effectuer la requête
            String response = restTemplate.getForObject(url, String.class);

            // Parser la réponse
            GeocodingResult result = parseNominatimResponse(response, latitude, longitude);

            // Mettre en cache le résultat
            if (cacheEnabled && result.isSuccess()) {
                cacheResult(cacheKey, result);
            }

            logger.debug("Geocoding completed successfully for coordinates: {}, {}", latitude, longitude);
            return result;

        } catch (RestClientException e) {
            logger.error("Error performing reverse geocoding for coordinates: {}, {}", latitude, longitude, e);
            return createErrorResult("Geocoding service unavailable: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during geocoding for coordinates: {}, {}", latitude, longitude, e);
            return createErrorResult("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Construit l'URL de requête Nominatim
     */
    private String buildNominatimUrl(BigDecimal latitude, BigDecimal longitude) {
        Map<String, String> params = new HashMap<>();
        params.put("lat", latitude.toString());
        params.put("lon", longitude.toString());
        params.put("format", "json");
        params.put("addressdetails", "1");
        params.put("accept-language", "pt,fr,en");
        params.put("zoom", "18");
        params.put("email", "contact@precodicaju.gw"); // Email requis par Nominatim

        StringBuilder url = new StringBuilder(nominatimUrl);
        url.append("?");

        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) {
                url.append("&");
            }
            url.append(entry.getKey()).append("=").append(entry.getValue());
            first = false;
        }

        return url.toString();
    }

    /**
     * Parse la réponse JSON de Nominatim
     */
    private GeocodingResult parseNominatimResponse(String response, BigDecimal latitude, BigDecimal longitude) {
        try {
            JsonNode root = objectMapper.readTree(response);

            if (root.isArray() && root.size() > 0) {
                JsonNode firstResult = root.get(0);
                return parseNominatimResult(firstResult, latitude, longitude);
            } else if (root.isObject()) {
                return parseNominatimResult(root, latitude, longitude);
            } else {
                return createErrorResult("No geocoding results found");
            }

        } catch (Exception e) {
            logger.error("Error parsing Nominatim response", e);
            return createErrorResult("Error parsing geocoding response");
        }
    }

    /**
     * Parse un résultat individuel de Nominatim
     */
    private GeocodingResult parseNominatimResult(JsonNode result, BigDecimal latitude, BigDecimal longitude) {
        GeocodingResult geocodingResult = new GeocodingResult();
        geocodingResult.setLatitude(latitude);
        geocodingResult.setLongitude(longitude);
        geocodingResult.setSuccess(true);

        // Extraire les informations d'adresse
        JsonNode address = result.get("address");
        if (address != null) {
            geocodingResult.setCountry(extractField(address, "country"));
            geocodingResult.setState(extractField(address, "state"));
            geocodingResult.setCounty(extractField(address, "county"));
            geocodingResult.setCity(extractField(address, "city"));
            geocodingResult.setTown(extractField(address, "town"));
            geocodingResult.setVillage(extractField(address, "village"));
            geocodingResult.setHamlet(extractField(address, "hamlet"));
            geocodingResult.setSuburb(extractField(address, "suburb"));
            geocodingResult.setRoad(extractField(address, "road"));
            geocodingResult.setHouseNumber(extractField(address, "house_number"));
            geocodingResult.setPostcode(extractField(address, "postcode"));
        }

        // Extraire le nom d'affichage
        JsonNode displayName = result.get("display_name");
        if (displayName != null) {
            geocodingResult.setDisplayName(displayName.asText());
        }

        // Extraire le type de lieu
        JsonNode type = result.get("type");
        if (type != null) {
            geocodingResult.setPlaceType(type.asText());
        }

        // Extraire la classe de lieu
        JsonNode placeClass = result.get("class");
        if (placeClass != null) {
            geocodingResult.setPlaceClass(placeClass.asText());
        }

        // Extraire l'importance
        JsonNode importance = result.get("importance");
        if (importance != null) {
            geocodingResult.setImportance(importance.asDouble());
        }

        // Construire l'adresse formatée
        geocodingResult.setFormattedAddress(buildFormattedAddress(geocodingResult));

        return geocodingResult;
    }

    /**
     * Extrait un champ spécifique de l'objet address
     */
    private String extractField(JsonNode address, String fieldName) {
        JsonNode field = address.get(fieldName);
        return field != null ? field.asText() : null;
    }

    /**
     * Construit une adresse formatée à partir des composants
     */
    private String buildFormattedAddress(GeocodingResult result) {
        StringBuilder address = new StringBuilder();

        // Commencer par le numéro de maison et la route
        if (result.getHouseNumber() != null && result.getRoad() != null) {
            address.append(result.getHouseNumber()).append(" ").append(result.getRoad());
        } else if (result.getRoad() != null) {
            address.append(result.getRoad());
        }

        // Ajouter la ville/village
        String locality = result.getCity() != null ? result.getCity()
                : result.getTown() != null ? result.getTown()
                        : result.getVillage() != null ? result.getVillage()
                                : result.getHamlet() != null ? result.getHamlet() : null;

        if (locality != null) {
            if (address.length() > 0) {
                address.append(", ");
            }
            address.append(locality);
        }

        // Ajouter le comté/région
        if (result.getCounty() != null) {
            if (address.length() > 0) {
                address.append(", ");
            }
            address.append(result.getCounty());
        }

        // Ajouter l'état
        if (result.getState() != null) {
            if (address.length() > 0) {
                address.append(", ");
            }
            address.append(result.getState());
        }

        // Ajouter le pays
        if (result.getCountry() != null) {
            if (address.length() > 0) {
                address.append(", ");
            }
            address.append(result.getCountry());
        }

        return address.length() > 0 ? address.toString() : result.getDisplayName();
    }

    /**
     * Crée une clé de cache pour les coordonnées
     */
    private String createCacheKey(BigDecimal latitude, BigDecimal longitude) {
        // Arrondir à 4 décimales pour le cache (précision d'environ 11 mètres)
        BigDecimal roundedLat = latitude.setScale(4, RoundingMode.HALF_UP);
        BigDecimal roundedLng = longitude.setScale(4, RoundingMode.HALF_UP);
        return roundedLat.toString() + "," + roundedLng.toString();
    }

    /**
     * Met en cache le résultat de géocodage
     */
    private void cacheResult(String cacheKey, GeocodingResult result) {
        if (geocodingCache.size() >= cacheSize) {
            // Supprimer le plus ancien élément (simple implémentation)
            String oldestKey = geocodingCache.keySet().iterator().next();
            geocodingCache.remove(oldestKey);
        }
        geocodingCache.put(cacheKey, result);
        logger.debug("Cached geocoding result for key: {}", cacheKey);
    }

    /**
     * Crée un résultat d'erreur
     */
    private GeocodingResult createErrorResult(String errorMessage) {
        GeocodingResult result = new GeocodingResult();
        result.setSuccess(false);
        result.setErrorMessage(errorMessage);
        return result;
    }

    /**
     * Crée un résultat désactivé
     */
    private GeocodingResult createDisabledResult() {
        GeocodingResult result = new GeocodingResult();
        result.setSuccess(false);
        result.setErrorMessage("Geocoding is disabled");
        return result;
    }

    /**
     * Vide le cache de géocodage
     */
    public void clearCache() {
        geocodingCache.clear();
        logger.info("Geocoding cache cleared");
    }

    /**
     * Obtient les statistiques du cache
     */
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("size", geocodingCache.size());
        stats.put("maxSize", cacheSize);
        stats.put("enabled", cacheEnabled);
        return stats;
    }

    /**
     * Résultat de géocodage
     */
    public static class GeocodingResult {
        private BigDecimal latitude;
        private BigDecimal longitude;
        private boolean success;
        private String errorMessage;
        private String displayName;
        private String formattedAddress;
        private String country;
        private String state;
        private String county;
        private String city;
        private String town;
        private String village;
        private String hamlet;
        private String suburb;
        private String road;
        private String houseNumber;
        private String postcode;
        private String placeType;
        private String placeClass;
        private Double importance;

        // Getters et setters
        public BigDecimal getLatitude() {
            return latitude;
        }

        public void setLatitude(BigDecimal latitude) {
            this.latitude = latitude;
        }

        public BigDecimal getLongitude() {
            return longitude;
        }

        public void setLongitude(BigDecimal longitude) {
            this.longitude = longitude;
        }

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        public String getFormattedAddress() {
            return formattedAddress;
        }

        public void setFormattedAddress(String formattedAddress) {
            this.formattedAddress = formattedAddress;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getCounty() {
            return county;
        }

        public void setCounty(String county) {
            this.county = county;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getTown() {
            return town;
        }

        public void setTown(String town) {
            this.town = town;
        }

        public String getVillage() {
            return village;
        }

        public void setVillage(String village) {
            this.village = village;
        }

        public String getHamlet() {
            return hamlet;
        }

        public void setHamlet(String hamlet) {
            this.hamlet = hamlet;
        }

        public String getSuburb() {
            return suburb;
        }

        public void setSuburb(String suburb) {
            this.suburb = suburb;
        }

        public String getRoad() {
            return road;
        }

        public void setRoad(String road) {
            this.road = road;
        }

        public String getHouseNumber() {
            return houseNumber;
        }

        public void setHouseNumber(String houseNumber) {
            this.houseNumber = houseNumber;
        }

        public String getPostcode() {
            return postcode;
        }

        public void setPostcode(String postcode) {
            this.postcode = postcode;
        }

        public String getPlaceType() {
            return placeType;
        }

        public void setPlaceType(String placeType) {
            this.placeType = placeType;
        }

        public String getPlaceClass() {
            return placeClass;
        }

        public void setPlaceClass(String placeClass) {
            this.placeClass = placeClass;
        }

        public Double getImportance() {
            return importance;
        }

        public void setImportance(Double importance) {
            this.importance = importance;
        }
    }
}
