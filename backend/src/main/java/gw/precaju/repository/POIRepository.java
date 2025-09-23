package gw.precaju.repository;

import gw.precaju.entity.POI;
import gw.precaju.entity.POIType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface POIRepository extends JpaRepository<POI, UUID> {

    // Basic queries - using explicit table name in JPQL
    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.active = true")
    List<POI> findByActiveTrue();

    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.id = :id AND p.active = true")
    Optional<POI> findByIdAndActiveTrue(@Param("id") UUID id);

    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.active = true ORDER BY p.nom")
    List<POI> findByActiveTrueOrderByNom();

    // Type-based queries
    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.type = :type AND p.active = true")
    List<POI> findByTypeAndActiveTrue(@Param("type") POIType type);

    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.type = :type AND p.active = true ORDER BY p.nom")
    List<POI> findByTypeActiveTrueOrderByNom(@Param("type") POIType type);

    // Search queries
    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.active = true AND " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "ORDER BY p.nom")
    List<POI> findByNomContainingIgnoreCaseAndActiveTrue(@Param("search") String search);

    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.active = true AND p.type = :type AND " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "ORDER BY p.nom")
    List<POI> findByTypeAndNomContainingIgnoreCaseAndActiveTrue(
            @Param("type") POIType type,
            @Param("search") String search);

    // Geographic queries - Bounding box
    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.active = true AND " +
            "p.latitude BETWEEN :minLat AND :maxLat AND " +
            "p.longitude BETWEEN :minLng AND :maxLng " +
            "ORDER BY p.nom")
    List<POI> findPOIsInBounds(
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng);

    // Geographic queries with type filter
    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.active = true AND p.type = :type AND " +
            "p.latitude BETWEEN :minLat AND :maxLat AND " +
            "p.longitude BETWEEN :minLng AND :maxLng " +
            "ORDER BY p.nom")
    List<POI> findPOIsInBoundsByType(
            @Param("type") POIType type,
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng);

    // Radius-based search (using Haversine distance approximation)
    @Query(value = """
            SELECT * FROM pois p
            WHERE p.active = true AND (
                6371 * acos(
                    cos(radians(:lat)) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(p.latitude))
                )
            ) <= :radiusKm
            ORDER BY p.nom
            """, nativeQuery = true)
    List<POI> findPOIsWithinRadius(
            @Param("lat") BigDecimal lat,
            @Param("lng") BigDecimal lng,
            @Param("radiusKm") Double radiusKm);

    // POIs with phone numbers
    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.active = true AND " +
            "p.telephone IS NOT NULL AND p.telephone <> '' " +
            "ORDER BY p.nom")
    List<POI> findPOIsWithPhone();

    // Complex filtering with Pageable
    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.active = true AND " +
            "(:type IS NULL OR p.type = :type) AND " +
            "(:search IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:minLat IS NULL OR p.latitude >= :minLat) AND " +
            "(:maxLat IS NULL OR p.latitude <= :maxLat) AND " +
            "(:minLng IS NULL OR p.longitude >= :minLng) AND " +
            "(:maxLng IS NULL OR p.longitude <= :maxLng)")
    Page<POI> findPOIsWithFilters(
            @Param("type") POIType type,
            @Param("search") String search,
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng,
            Pageable pageable);

    // Statistics queries
    @Query("SELECT COUNT(p) FROM gw.precaju.entity.POI p WHERE p.active = true")
    Long countActivePOIs();

    @Query("SELECT COUNT(p) FROM gw.precaju.entity.POI p WHERE p.active = true AND p.type = :type")
    Long countActivePOIsByType(@Param("type") POIType type);

    // Check if POI name exists (for validation)
    boolean existsByNomAndActiveTrue(String nom);

    boolean existsByNomAndActiveTrueAndIdNot(String nom, UUID id);

    // Find by coordinates (for duplicate detection)
    @Query("SELECT p FROM gw.precaju.entity.POI p WHERE p.active = true AND " +
            "ABS(p.latitude - :lat) < 0.0001 AND " +
            "ABS(p.longitude - :lng) < 0.0001")
    List<POI> findByCoordinatesApproximate(
            @Param("lat") BigDecimal latitude,
            @Param("lng") BigDecimal longitude);
}