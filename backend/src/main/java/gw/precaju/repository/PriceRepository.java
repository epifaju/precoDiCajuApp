package gw.precaju.repository;

import gw.precaju.entity.Price;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PriceRepository extends JpaRepository<Price, UUID> {

    Page<Price> findByActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Price p WHERE p.active = true " +
            "AND (:regionCode IS NULL OR p.region.code = :regionCode) " +
            "AND (:qualityGrade IS NULL OR p.qualityGrade.code = :qualityGrade) " +
            "AND (:fromDate IS NULL OR p.recordedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR p.recordedDate <= :toDate) " +
            "ORDER BY p.recordedDate DESC, p.createdAt DESC")
    Page<Price> findWithFilters(@Param("regionCode") String regionCode,
            @Param("qualityGrade") String qualityGrade,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);

    @Query("SELECT p FROM Price p WHERE p.active = true AND p.verified = true " +
            "AND p.region.code = :regionCode AND p.qualityGrade.code = :qualityGrade " +
            "AND p.recordedDate >= :fromDate " +
            "ORDER BY p.recordedDate DESC")
    List<Price> findRecentVerifiedPrices(@Param("regionCode") String regionCode,
            @Param("qualityGrade") String qualityGrade,
            @Param("fromDate") LocalDate fromDate);

    @Query("SELECT AVG(p.priceFcfa) FROM Price p WHERE p.active = true " +
            "AND (:regionCode IS NULL OR p.region.code = :regionCode) " +
            "AND (:qualityGrade IS NULL OR p.qualityGrade.code = :qualityGrade) " +
            "AND p.recordedDate >= :fromDate")
    Optional<BigDecimal> findAveragePrice(@Param("regionCode") String regionCode,
            @Param("qualityGrade") String qualityGrade,
            @Param("fromDate") LocalDate fromDate);

    @Query("SELECT MIN(p.priceFcfa), MAX(p.priceFcfa) FROM Price p WHERE p.active = true " +
            "AND (:regionCode IS NULL OR p.region.code = :regionCode) " +
            "AND (:qualityGrade IS NULL OR p.qualityGrade.code = :qualityGrade) " +
            "AND p.recordedDate >= :fromDate")
    List<Object[]> findPriceRange(@Param("regionCode") String regionCode,
            @Param("qualityGrade") String qualityGrade,
            @Param("fromDate") LocalDate fromDate);

    @Query("SELECT p FROM Price p WHERE p.active = true AND p.createdBy.id = :userId " +
            "ORDER BY p.createdAt DESC")
    Page<Price> findByCreatedByIdAndActiveTrue(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT p FROM Price p WHERE p.active = true AND p.verified = false " +
            "ORDER BY p.createdAt ASC")
    Page<Price> findUnverifiedPrices(Pageable pageable);

    @Query("SELECT COUNT(p) FROM Price p WHERE p.active = true AND p.verified = false")
    long countUnverifiedPrices();

    @Query("SELECT p FROM Price p WHERE p.active = true " +
            "AND p.gpsLat IS NOT NULL AND p.gpsLng IS NOT NULL " +
            "AND p.gpsLat BETWEEN :minLat AND :maxLat " +
            "AND p.gpsLng BETWEEN :minLng AND :maxLng " +
            "AND p.recordedDate >= :fromDate")
    List<Price> findPricesInGeoBox(@Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng,
            @Param("fromDate") LocalDate fromDate);

    @Query("SELECT p.region.code, COUNT(p) FROM Price p WHERE p.active = true " +
            "AND p.recordedDate >= :fromDate GROUP BY p.region.code")
    List<Object[]> countPricesByRegion(@Param("fromDate") LocalDate fromDate);

    @Query("SELECT p.qualityGrade.code, COUNT(p) FROM Price p WHERE p.active = true " +
            "AND p.recordedDate >= :fromDate GROUP BY p.qualityGrade.code")
    List<Object[]> countPricesByQuality(@Param("fromDate") LocalDate fromDate);
}

