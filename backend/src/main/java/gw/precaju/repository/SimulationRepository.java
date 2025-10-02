package gw.precaju.repository;

import gw.precaju.entity.Simulation;
import gw.precaju.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface SimulationRepository extends JpaRepository<Simulation, UUID> {

    /**
     * Find all simulations for a specific user, ordered by creation date (newest
     * first)
     */
    List<Simulation> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find all simulations for a specific user with pagination
     */
    Page<Simulation> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Find simulations for a user within a date range
     */
    @Query("SELECT s FROM Simulation s WHERE s.user = :user AND s.createdAt BETWEEN :startDate AND :endDate ORDER BY s.createdAt DESC")
    List<Simulation> findByUserAndCreatedAtBetween(@Param("user") User user,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    /**
     * Find simulations with positive net revenue for a user
     */
    @Query("SELECT s FROM Simulation s WHERE s.user = :user AND s.netRevenue > 0 ORDER BY s.netRevenue DESC")
    List<Simulation> findProfitableSimulationsByUser(@Param("user") User user);

    /**
     * Find simulations with negative net revenue for a user
     */
    @Query("SELECT s FROM Simulation s WHERE s.user = :user AND s.netRevenue < 0 ORDER BY s.netRevenue ASC")
    List<Simulation> findLossMakingSimulationsByUser(@Param("user") User user);

    /**
     * Calculate average net revenue for a user
     */
    @Query("SELECT AVG(s.netRevenue) FROM Simulation s WHERE s.user = :user")
    BigDecimal calculateAverageNetRevenueByUser(@Param("user") User user);

    /**
     * Calculate total net revenue for a user
     */
    @Query("SELECT SUM(s.netRevenue) FROM Simulation s WHERE s.user = :user")
    BigDecimal calculateTotalNetRevenueByUser(@Param("user") User user);

    /**
     * Count simulations for a user
     */
    long countByUser(User user);

    /**
     * Count profitable simulations for a user
     */
    @Query("SELECT COUNT(s) FROM Simulation s WHERE s.user = :user AND s.netRevenue > 0")
    long countProfitableSimulationsByUser(@Param("user") User user);

    /**
     * Find simulations with net revenue in a specific range
     */
    @Query("SELECT s FROM Simulation s WHERE s.user = :user AND s.netRevenue BETWEEN :minRevenue AND :maxRevenue ORDER BY s.netRevenue DESC")
    List<Simulation> findByUserAndNetRevenueBetween(@Param("user") User user,
            @Param("minRevenue") BigDecimal minRevenue,
            @Param("maxRevenue") BigDecimal maxRevenue);

    /**
     * Find the most recent simulation for a user
     */
    @Query("SELECT s FROM Simulation s WHERE s.user = :user ORDER BY s.createdAt DESC LIMIT 1")
    Simulation findMostRecentByUser(@Param("user") User user);

    /**
     * Delete all simulations for a user
     */
    void deleteByUser(User user);

    /**
     * Find simulations created after a specific date
     */
    @Query("SELECT s FROM Simulation s WHERE s.user = :user AND s.createdAt > :since ORDER BY s.createdAt DESC")
    List<Simulation> findByUserAndCreatedAtAfter(@Param("user") User user, @Param("since") Instant since);
}

