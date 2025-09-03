package gw.precaju.service;

import gw.precaju.controller.WebSocketController;
import gw.precaju.dto.PriceDTO;
import gw.precaju.dto.PriceStatsDTO;
import gw.precaju.dto.request.CreatePriceRequest;
import gw.precaju.entity.*;
import gw.precaju.mapper.PriceMapper;
import gw.precaju.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PriceService {

    private static final Logger logger = LoggerFactory.getLogger(PriceService.class);

    private final PriceRepository priceRepository;
    private final RegionRepository regionRepository;
    private final QualityGradeRepository qualityGradeRepository;
    private final UserRepository userRepository;
    private final PriceMapper priceMapper;
    private final FileStorageService fileStorageService;
    private final WebSocketController webSocketController;
    private final GpsValidationService gpsValidationService;
    private final GpsGeocodingService gpsGeocodingService;

    public PriceService(PriceRepository priceRepository,
            RegionRepository regionRepository,
            QualityGradeRepository qualityGradeRepository,
            UserRepository userRepository,
            PriceMapper priceMapper,
            FileStorageService fileStorageService,
            WebSocketController webSocketController,
            GpsValidationService gpsValidationService,
            GpsGeocodingService gpsGeocodingService) {
        this.priceRepository = priceRepository;
        this.regionRepository = regionRepository;
        this.qualityGradeRepository = qualityGradeRepository;
        this.userRepository = userRepository;
        this.priceMapper = priceMapper;
        this.fileStorageService = fileStorageService;
        this.webSocketController = webSocketController;
        this.gpsValidationService = gpsValidationService;
        this.gpsGeocodingService = gpsGeocodingService;
    }

    @Transactional(readOnly = true)
    public Page<PriceDTO> getAllPrices(String regionCode, String qualityGrade,
            LocalDate fromDate, LocalDate toDate, Boolean verified,
            Pageable pageable, String language) {

        logger.debug("Getting prices with filters - region: {}, quality: {}, fromDate: {}, toDate: {}, verified: {}",
                regionCode, qualityGrade, fromDate, toDate, verified);

        try {
            // Validate date parameters
            if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
                logger.warn("Invalid date range: fromDate {} is after toDate {}", fromDate, toDate);
                throw new IllegalArgumentException("fromDate cannot be after toDate");
            }

            // Check if we have any filters
            boolean hasFilters = (regionCode != null && !regionCode.trim().isEmpty()) ||
                    (qualityGrade != null && !qualityGrade.trim().isEmpty()) ||
                    fromDate != null || toDate != null || verified != null;

            Page<Price> prices;
            if (!hasFilters) {
                // No filters - use simple method
                logger.debug("No filters applied, using simple query");
                prices = priceRepository.findAllActive(pageable);
            } else {
                // Has filters - use safe filtered method
                logger.debug("Filters applied, using safe filtered query");
                prices = priceRepository.findWithFiltersSafe(regionCode, qualityGrade, fromDate, toDate, verified,
                        pageable);
            }

            logger.debug("Found {} prices with filters", prices.getTotalElements());
            return prices.map(price -> priceMapper.toDTOWithLocalizedNames(price, language));

        } catch (Exception e) {
            logger.error(
                    "Error retrieving prices with filters - region: {}, quality: {}, fromDate: {}, toDate: {}, verified: {}",
                    regionCode, qualityGrade, fromDate, toDate, verified, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public Optional<PriceDTO> getPriceById(UUID id, String language) {
        return priceRepository.findById(id)
                .filter(price -> price.getActive())
                .map(price -> priceMapper.toDTOWithLocalizedNames(price, language));
    }

    public PriceDTO createPrice(CreatePriceRequest request, User currentUser) {
        logger.info("Creating new price for region {} and quality {}",
                request.getRegionCode(), request.getQualityGrade());

        // Validate region
        Region region = regionRepository.findByCodeAndActiveTrue(request.getRegionCode())
                .orElseThrow(() -> new RuntimeException("Invalid region code: " + request.getRegionCode()));

        // Validate quality grade
        QualityGrade qualityGrade = qualityGradeRepository.findByCodeAndActiveTrue(request.getQualityGrade())
                .orElseThrow(() -> new RuntimeException("Invalid quality grade: " + request.getQualityGrade()));

        // Validate GPS coordinates if provided
        if (request.getGpsLat() != null && request.getGpsLng() != null) {
            logger.debug("Validating GPS coordinates for price creation");
            GpsValidationService.GpsValidationResult gpsValidation = gpsValidationService.validatePriceGps(request);

            if (!gpsValidation.isValid()) {
                logger.warn("Invalid GPS coordinates for price: {}", gpsValidation.getErrors());
                throw new RuntimeException("Invalid GPS coordinates: " + String.join(", ", gpsValidation.getErrors()));
            }

            if (!gpsValidation.getWarnings().isEmpty()) {
                logger.info("GPS validation warnings for price: {}", gpsValidation.getWarnings());
            }

            logger.info("GPS coordinates validated successfully with quality score: {}",
                    gpsValidation.getQualityScore());
        }

        // Create price entity
        Price price = new Price();
        price.setRegion(region);
        price.setQualityGrade(qualityGrade);
        price.setPriceFcfa(request.getPriceFcfa());
        price.setRecordedDate(request.getRecordedDate());
        price.setSourceName(request.getSourceName());
        price.setSourceType(request.getSourceType());
        price.setGpsLat(request.getGpsLat());
        price.setGpsLng(request.getGpsLng());
        price.setNotes(request.getNotes());
        price.setCreatedBy(currentUser);
        price.setVerified(false); // New prices are unverified by default

        // Handle photo upload
        if (request.getPhotoFile() != null && !request.getPhotoFile().isEmpty()) {
            try {
                String photoUrl = fileStorageService.storeFile(request.getPhotoFile());
                price.setPhotoUrl(photoUrl);
            } catch (Exception e) {
                logger.error("Error uploading photo for price", e);
                throw new RuntimeException("Failed to upload photo: " + e.getMessage());
            }
        }

        price = priceRepository.save(price);

        // Update user reputation
        updateUserReputation(currentUser, 1);

        logger.info("Price created successfully with ID: {}", price.getId());

        // Broadcast new price via WebSocket
        try {
            PriceDTO priceDTO = priceMapper.toDTO(price);
            webSocketController.broadcastNewPrice(priceDTO);

            // Check for significant price variations and send notifications
            checkAndNotifyPriceVariation(priceDTO);
        } catch (Exception e) {
            logger.error("Error broadcasting new price via WebSocket", e);
        }

        return priceMapper.toDTO(price);
    }

    public PriceDTO updatePrice(UUID id, CreatePriceRequest request, User currentUser) {
        Price price = priceRepository.findById(id)
                .filter(p -> p.getActive())
                .orElseThrow(() -> new RuntimeException("Price not found"));

        // Check if user can update this price
        if (!canUserModifyPrice(currentUser, price)) {
            throw new RuntimeException("You don't have permission to update this price");
        }

        // Update fields
        if (request.getPriceFcfa() != null) {
            price.setPriceFcfa(request.getPriceFcfa());
        }
        if (request.getRecordedDate() != null) {
            price.setRecordedDate(request.getRecordedDate());
        }
        if (request.getSourceName() != null) {
            price.setSourceName(request.getSourceName());
        }
        if (request.getSourceType() != null) {
            price.setSourceType(request.getSourceType());
        }
        if (request.getNotes() != null) {
            price.setNotes(request.getNotes());
        }

        // Handle photo update
        if (request.getPhotoFile() != null && !request.getPhotoFile().isEmpty()) {
            try {
                // Delete old photo if exists
                if (price.getPhotoUrl() != null) {
                    fileStorageService.deleteFile(price.getPhotoUrl());
                }

                String photoUrl = fileStorageService.storeFile(request.getPhotoFile());
                price.setPhotoUrl(photoUrl);
            } catch (Exception e) {
                logger.error("Error updating photo for price", e);
                throw new RuntimeException("Failed to update photo: " + e.getMessage());
            }
        }

        // Reset verification if significant changes made
        if (price.getVerified() && hasSignificantChanges(price, request)) {
            price.setVerified(false);
            price.setVerifiedBy(null);
            price.setVerifiedAt(null);
        }

        price = priceRepository.save(price);

        logger.info("Price {} updated successfully", price.getId());

        // Broadcast price update via WebSocket
        try {
            PriceDTO priceDTO = priceMapper.toDTO(price);
            webSocketController.broadcastPriceUpdate(priceDTO);
        } catch (Exception e) {
            logger.error("Error broadcasting price update via WebSocket", e);
        }

        return priceMapper.toDTO(price);
    }

    public void deletePrice(UUID id, User currentUser) {
        Price price = priceRepository.findById(id)
                .filter(p -> p.getActive())
                .orElseThrow(() -> new RuntimeException("Price not found"));

        if (!canUserModifyPrice(currentUser, price)) {
            throw new RuntimeException("You don't have permission to delete this price");
        }

        // Soft delete
        price.setActive(false);
        priceRepository.save(price);

        // Update user reputation
        updateUserReputation(currentUser, -1);

        logger.info("Price {} deleted by user {}", price.getId(), currentUser.getEmail());
    }

    public PriceDTO verifyPrice(UUID id, User verifier) {
        Price price = priceRepository.findById(id)
                .filter(p -> p.getActive())
                .orElseThrow(() -> new RuntimeException("Price not found"));

        if (!canUserVerifyPrice(verifier, price)) {
            throw new RuntimeException("You don't have permission to verify this price");
        }

        price.verify(verifier);
        price = priceRepository.save(price);

        // Update creator reputation
        if (price.getCreatedBy() != null) {
            updateUserReputation(price.getCreatedBy(), 5);
        }

        logger.info("Price {} verified by {}", price.getId(), verifier.getEmail());

        // Broadcast price verification via WebSocket
        try {
            PriceDTO priceDTO = priceMapper.toDTO(price);
            webSocketController.broadcastPriceVerification(priceDTO);

            // Send notification to the price creator
            if (price.getCreatedBy() != null) {
                webSocketController.sendNotificationToUser(
                        price.getCreatedBy().getId().toString(),
                        "Prix Vérifié",
                        String.format("Votre prix de %s FCFA/kg pour %s a été vérifié par %s",
                                price.getPriceFcfa(),
                                price.getQualityGrade().getNamePt(),
                                verifier.getFullName()),
                        "success");
            }
        } catch (Exception e) {
            logger.error("Error broadcasting price verification via WebSocket", e);
        }

        return priceMapper.toDTO(price);
    }

    @Transactional(readOnly = true)
    public PriceStatsDTO getPriceStatistics(String regionCode, String qualityGrade,
            Integer periodDays, String language) {
        logger.info("Getting price statistics - region: {}, quality: {}, periodDays: {}, language: {}",
                regionCode, qualityGrade, periodDays, language);

        try {
            // Validate and set default values
            if (periodDays == null || periodDays < 1) {
                periodDays = 30;
                logger.warn("Invalid periodDays parameter, using default value: {}", periodDays);
            }
            if (periodDays > 365) {
                periodDays = 365;
                logger.warn("periodDays parameter too large, limiting to: {}", periodDays);
            }

            LocalDate fromDate = LocalDate.now().minusDays(periodDays);
            logger.debug("Calculated fromDate: {}", fromDate);

            PriceStatsDTO stats = new PriceStatsDTO();
            stats.setPeriodDays(periodDays);
            stats.setLastUpdated(java.time.Instant.now());

            // Get filtered prices for statistics
            logger.debug("Querying prices with filters - region: {}, quality: {}, fromDate: {}",
                    regionCode, qualityGrade, fromDate);

            // Use appropriate method based on which parameters are provided
            List<Price> priceList;
            if (regionCode != null && qualityGrade != null) {
                // Both region and quality specified
                priceList = priceRepository.findPricesForStatisticsWithAllParams(
                        regionCode, qualityGrade, fromDate);
            } else if (regionCode != null) {
                // Only region specified
                priceList = priceRepository.findPricesForStatisticsByRegion(regionCode, fromDate);
            } else if (qualityGrade != null) {
                // Only quality specified
                priceList = priceRepository.findPricesForStatisticsByQuality(qualityGrade, fromDate);
            } else {
                // No filters, just date
                priceList = priceRepository.findPricesForStatisticsByDateOnly(fromDate);
            }
            logger.info("Found {} prices for statistics calculation", priceList.size());

            if (priceList.isEmpty()) {
                logger.info("No prices found for the specified criteria, returning empty stats");
                return stats;
            }

            // Calculate basic stats
            stats.setTotalPrices(priceList.size());

            // Filter out prices with null values and collect valid price values
            List<BigDecimal> priceValues = priceList.stream()
                    .map(Price::getPriceFcfa)
                    .filter(Objects::nonNull)
                    .sorted()
                    .collect(Collectors.toList());

            if (priceValues.isEmpty()) {
                logger.warn("No valid price values found (all prices have null priceFcfa)");
                return stats;
            }

            logger.debug("Processing {} valid price values", priceValues.size());

            // Set min and max prices
            stats.setMinPrice(priceValues.get(0));
            stats.setMaxPrice(priceValues.get(priceValues.size() - 1));
            logger.debug("Min price: {}, Max price: {}", stats.getMinPrice(), stats.getMaxPrice());

            // Calculate average price
            BigDecimal avgPrice = priceValues.stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(priceValues.size()), 2, BigDecimal.ROUND_HALF_UP);
            stats.setAveragePrice(avgPrice);
            logger.debug("Average price: {}", avgPrice);

            // Count verified vs unverified
            long verifiedCount = priceList.stream()
                    .mapToLong(p -> p.getVerified() ? 1 : 0)
                    .sum();
            stats.setVerifiedPrices(verifiedCount);
            stats.setUnverifiedPrices(priceList.size() - verifiedCount);
            logger.debug("Verified prices: {}, Unverified prices: {}",
                    stats.getVerifiedPrices(), stats.getUnverifiedPrices());

            // Group by region (with null safety)
            Map<String, Long> pricesByRegion = priceList.stream()
                    .filter(p -> p.getRegion() != null && p.getRegion().getCode() != null)
                    .collect(Collectors.groupingBy(
                            p -> p.getRegion().getCode(),
                            Collectors.counting()));
            stats.setPricesByRegion(pricesByRegion);
            logger.debug("Prices by region: {}", pricesByRegion);

            // Group by quality (with null safety)
            Map<String, Long> pricesByQuality = priceList.stream()
                    .filter(p -> p.getQualityGrade() != null && p.getQualityGrade().getCode() != null)
                    .collect(Collectors.groupingBy(
                            p -> p.getQualityGrade().getCode(),
                            Collectors.counting()));
            stats.setPricesByQuality(pricesByQuality);
            logger.debug("Prices by quality: {}", pricesByQuality);

            // Average prices by region (with null safety)
            Map<String, BigDecimal> avgPricesByRegion = priceList.stream()
                    .filter(p -> p.getRegion() != null && p.getRegion().getCode() != null && p.getPriceFcfa() != null)
                    .collect(Collectors.groupingBy(
                            p -> p.getRegion().getCode(),
                            Collectors.averagingDouble(p -> p.getPriceFcfa().doubleValue())))
                    .entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            e -> BigDecimal.valueOf(e.getValue()).setScale(2, BigDecimal.ROUND_HALF_UP)));
            stats.setAveragePricesByRegion(avgPricesByRegion);
            logger.debug("Average prices by region: {}", avgPricesByRegion);

            // Average prices by quality (with null safety)
            Map<String, BigDecimal> avgPricesByQuality = priceList.stream()
                    .filter(p -> p.getQualityGrade() != null && p.getQualityGrade().getCode() != null
                            && p.getPriceFcfa() != null)
                    .collect(Collectors.groupingBy(
                            p -> p.getQualityGrade().getCode(),
                            Collectors.averagingDouble(p -> p.getPriceFcfa().doubleValue())))
                    .entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            e -> BigDecimal.valueOf(e.getValue()).setScale(2, BigDecimal.ROUND_HALF_UP)));
            stats.setAveragePricesByQuality(avgPricesByQuality);
            logger.debug("Average prices by quality: {}", avgPricesByQuality);

            logger.info("Successfully calculated price statistics for {} prices", priceList.size());
            return stats;

        } catch (Exception e) {
            logger.error("Error calculating price statistics - region: {}, quality: {}, periodDays: {}",
                    regionCode, qualityGrade, periodDays, e);
            throw new RuntimeException("Failed to calculate price statistics: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<PriceDTO> getUserPrices(UUID userId, Pageable pageable, String language) {
        Page<Price> prices = priceRepository.findByCreatedByIdAndActiveTrue(userId, pageable);
        return prices.map(price -> priceMapper.toDTOWithLocalizedNames(price, language));
    }

    @Transactional(readOnly = true)
    public Page<PriceDTO> getUnverifiedPrices(Pageable pageable, String language) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").ascending());

        Page<Price> prices = priceRepository.findUnverifiedPrices(sortedPageable);
        return prices.map(price -> priceMapper.toDTOWithLocalizedNames(price, language));
    }

    private boolean canUserModifyPrice(User user, Price price) {
        // Admins and moderators can modify any price
        if (user.isAdmin() || user.isModerator()) {
            return true;
        }

        // Users can only modify their own prices
        return Objects.equals(user.getId(), price.getCreatedBy().getId());
    }

    private boolean canUserVerifyPrice(User user, Price price) {
        // Only admins and moderators can verify prices
        if (!user.isModerator()) {
            return false;
        }

        // Users cannot verify their own prices
        return !Objects.equals(user.getId(), price.getCreatedBy().getId());
    }

    private boolean hasSignificantChanges(Price price, CreatePriceRequest request) {
        // Check if price changed by more than 10%
        if (request.getPriceFcfa() != null) {
            BigDecimal currentPrice = price.getPriceFcfa();
            BigDecimal newPrice = request.getPriceFcfa();
            BigDecimal percentChange = newPrice.subtract(currentPrice)
                    .divide(currentPrice, 4, BigDecimal.ROUND_HALF_UP)
                    .abs();

            return percentChange.compareTo(BigDecimal.valueOf(0.1)) > 0;
        }

        return false;
    }

    private void updateUserReputation(User user, int points) {
        user.setReputationScore(user.getReputationScore() + points);
        userRepository.save(user);
    }

    /**
     * Check for significant price variations and send notifications
     */
    private void checkAndNotifyPriceVariation(PriceDTO newPrice) {
        try {
            // Get recent prices for the same region and quality
            LocalDate fromDate = LocalDate.now().minusDays(7); // Last 7 days
            List<Price> recentPrices = priceRepository.findPricesForStatisticsWithAllParams(
                    newPrice.getRegion(),
                    newPrice.getQuality(),
                    fromDate);

            if (recentPrices.size() > 1) {
                // Calculate average price excluding the new one
                BigDecimal avgPrice = recentPrices.stream()
                        .filter(p -> !p.getId().toString().equals(newPrice.getId()))
                        .map(Price::getPriceFcfa)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(recentPrices.size() - 1), 2, BigDecimal.ROUND_HALF_UP);

                if (avgPrice.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal newPriceValue = newPrice.getPriceFcfa();
                    BigDecimal percentChange = newPriceValue.subtract(avgPrice)
                            .divide(avgPrice, 4, BigDecimal.ROUND_HALF_UP)
                            .abs();

                    // If price variation is more than 10%, send notification
                    if (percentChange.compareTo(BigDecimal.valueOf(0.1)) > 0) {
                        String direction = newPriceValue.compareTo(avgPrice) > 0 ? "augmentation" : "diminution";
                        String message = String.format(
                                "Variation significative de prix détectée: %s de %.1f%% pour %s en %s",
                                direction,
                                percentChange.multiply(BigDecimal.valueOf(100)).doubleValue(),
                                newPrice.getQualityName(),
                                newPrice.getRegionName());

                        // Broadcast price alert to all users
                        Map<String, Object> alert = new HashMap<>();
                        alert.put("type", "price_alert");
                        alert.put("title", "Alerte Prix");
                        alert.put("message", message);
                        alert.put("price", newPrice);
                        alert.put("variation", percentChange.multiply(BigDecimal.valueOf(100)).doubleValue());
                        alert.put("timestamp", System.currentTimeMillis());

                        webSocketController.broadcastToTopic("/topic/price_alerts", alert);
                        logger.info("Price variation alert sent: {}% change",
                                percentChange.multiply(BigDecimal.valueOf(100)));
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error checking price variation", e);
        }
    }

    /**
     * Broadcast updated statistics to all connected users
     */
    public void broadcastStatsUpdate() {
        try {
            PriceStatsDTO stats = getPriceStatistics(null, null, 30, "pt");
            webSocketController.broadcastStatsUpdate(stats);
        } catch (Exception e) {
            logger.error("Error broadcasting stats update", e);
        }
    }

    /**
     * Récupère l'historique des prix pour une région et qualité spécifiques
     * Utilisé pour les graphiques sparklines
     */
    public List<PriceDTO> getPriceHistory(String regionCode, String qualityGrade, int days, String language) {
        logger.debug("Getting price history for region: {}, quality: {}, days: {}", regionCode, qualityGrade, days);

        // Calculer la date de début
        LocalDate startDate = LocalDate.now().minusDays(days);

        // Récupérer les prix de la région et qualité spécifiées
        List<Price> prices = priceRepository.findByRegionCodeAndQualityGradeAndRecordedDateAfterOrderByRecordedDateAsc(
                regionCode, qualityGrade, startDate);

        if (prices.isEmpty()) {
            logger.debug("No price history found for region: {}, quality: {}", regionCode, qualityGrade);
            return Collections.emptyList();
        }

        // Grouper les prix par date et calculer la moyenne quotidienne
        Map<LocalDate, List<Price>> pricesByDate = prices.stream()
                .collect(Collectors.groupingBy(Price::getRecordedDate));

        List<PriceDTO> history = new ArrayList<>();

        for (Map.Entry<LocalDate, List<Price>> entry : pricesByDate.entrySet()) {
            LocalDate date = entry.getKey();
            List<Price> dayPrices = entry.getValue();

            // Calculer la moyenne des prix pour cette date
            double averagePrice = dayPrices.stream()
                    .mapToDouble(p -> p.getPriceFcfa().doubleValue())
                    .average()
                    .orElse(0.0);

            // Créer un DTO pour cette date
            PriceDTO priceDTO = new PriceDTO();
            priceDTO.setId(dayPrices.get(0).getId());
            priceDTO.setRegion(regionCode);
            priceDTO.setRegionName(dayPrices.get(0).getRegion().getNamePt()); // Utiliser le nom de la région
            priceDTO.setQuality(qualityGrade);
            priceDTO.setQualityName(dayPrices.get(0).getQualityGrade().getNamePt()); // Utiliser le nom de la qualité
            priceDTO.setPriceFcfa(BigDecimal.valueOf(averagePrice));
            priceDTO.setUnit("kg");
            priceDTO.setRecordedDate(date);
            priceDTO.setVerified(dayPrices.stream().anyMatch(p -> Boolean.TRUE.equals(p.getVerified())));
            priceDTO.setCreatedAt(dayPrices.get(0).getCreatedAt());

            history.add(priceDTO);
        }

        // Trier par date
        history.sort(Comparator.comparing(PriceDTO::getRecordedDate));

        logger.debug("Retrieved {} price history entries for region: {}, quality: {}",
                history.size(), regionCode, qualityGrade);

        return history;
    }
}
