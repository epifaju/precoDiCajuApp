package gw.precaju.service;

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

    public PriceService(PriceRepository priceRepository,
                       RegionRepository regionRepository,
                       QualityGradeRepository qualityGradeRepository,
                       UserRepository userRepository,
                       PriceMapper priceMapper,
                       FileStorageService fileStorageService) {
        this.priceRepository = priceRepository;
        this.regionRepository = regionRepository;
        this.qualityGradeRepository = qualityGradeRepository;
        this.userRepository = userRepository;
        this.priceMapper = priceMapper;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public Page<PriceDTO> getAllPrices(String regionCode, String qualityGrade, 
                                      LocalDate fromDate, LocalDate toDate, 
                                      Pageable pageable, String language) {
        
        Page<Price> prices = priceRepository.findWithFilters(
            regionCode, qualityGrade, fromDate, toDate, pageable);
        
        return prices.map(price -> priceMapper.toDTOWithLocalizedNames(price, language));
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
        
        return priceMapper.toDTO(price);
    }

    @Transactional(readOnly = true)
    public PriceStatsDTO getPriceStatistics(String regionCode, String qualityGrade, 
                                           Integer periodDays, String language) {
        LocalDate fromDate = LocalDate.now().minusDays(periodDays != null ? periodDays : 30);
        
        PriceStatsDTO stats = new PriceStatsDTO();
        stats.setPeriodDays(periodDays != null ? periodDays : 30);
        stats.setLastUpdated(java.time.Instant.now());

        // Get filtered prices for statistics
        Page<Price> prices = priceRepository.findWithFilters(
            regionCode, qualityGrade, fromDate, null, 
            PageRequest.of(0, Integer.MAX_VALUE)
        );

        List<Price> priceList = prices.getContent();
        
        if (priceList.isEmpty()) {
            return stats;
        }

        // Calculate basic stats
        stats.setTotalPrices(priceList.size());
        
        List<BigDecimal> priceValues = priceList.stream()
            .map(Price::getPriceFcfa)
            .sorted()
            .collect(Collectors.toList());
            
        stats.setMinPrice(priceValues.get(0));
        stats.setMaxPrice(priceValues.get(priceValues.size() - 1));
        
        BigDecimal avgPrice = priceValues.stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(priceValues.size()), 2, BigDecimal.ROUND_HALF_UP);
        stats.setAveragePrice(avgPrice);

        // Count verified vs unverified
        long verifiedCount = priceList.stream().mapToLong(p -> p.getVerified() ? 1 : 0).sum();
        stats.setVerifiedPrices(verifiedCount);
        stats.setUnverifiedPrices(priceList.size() - verifiedCount);

        // Group by region
        Map<String, Long> pricesByRegion = priceList.stream()
            .collect(Collectors.groupingBy(
                p -> p.getRegion().getCode(),
                Collectors.counting()
            ));
        stats.setPricesByRegion(pricesByRegion);

        // Group by quality
        Map<String, Long> pricesByQuality = priceList.stream()
            .collect(Collectors.groupingBy(
                p -> p.getQualityGrade().getCode(),
                Collectors.counting()
            ));
        stats.setPricesByQuality(pricesByQuality);

        // Average prices by region
        Map<String, BigDecimal> avgPricesByRegion = priceList.stream()
            .collect(Collectors.groupingBy(
                p -> p.getRegion().getCode(),
                Collectors.averagingDouble(p -> p.getPriceFcfa().doubleValue())
            )).entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> BigDecimal.valueOf(e.getValue()).setScale(2, BigDecimal.ROUND_HALF_UP)
            ));
        stats.setAveragePricesByRegion(avgPricesByRegion);

        // Average prices by quality
        Map<String, BigDecimal> avgPricesByQuality = priceList.stream()
            .collect(Collectors.groupingBy(
                p -> p.getQualityGrade().getCode(),
                Collectors.averagingDouble(p -> p.getPriceFcfa().doubleValue())
            )).entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> BigDecimal.valueOf(e.getValue()).setScale(2, BigDecimal.ROUND_HALF_UP)
            ));
        stats.setAveragePricesByQuality(avgPricesByQuality);

        return stats;
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
            Sort.by("createdAt").ascending()
        );
        
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
}
