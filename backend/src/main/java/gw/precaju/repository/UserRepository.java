package gw.precaju.repository;

import gw.precaju.entity.User;
import gw.precaju.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

        Optional<User> findByEmail(String email);

        Optional<User> findByEmailAndActiveTrue(String email);

        boolean existsByEmail(String email);

        Page<User> findByActiveTrue(Pageable pageable);

        @Query("SELECT u FROM User u WHERE u.active = true ORDER BY u.createdAt DESC")
        Page<User> findAllActiveUsers(Pageable pageable);

        List<User> findByRole(UserRole role);

        @Query("SELECT u FROM User u WHERE u.active = true AND u.emailVerified = true")
        List<User> findAllActiveAndVerified();

        @Query("SELECT u FROM User u WHERE u.reputationScore >= :minScore ORDER BY u.reputationScore DESC")
        List<User> findByReputationScoreGreaterThanEqualOrderByReputationScoreDesc(@Param("minScore") Integer minScore);

        @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.active = true")
        long countByRoleAndActiveTrue(@Param("role") UserRole role);

        // Méthodes d'administration
        @Query("SELECT COUNT(u) FROM User u WHERE u.active = true")
        long countByActiveTrue();

        /**
         * Recherche d'utilisateurs avec filtres avancés (JPQL)
         * Gère correctement les paramètres NULL et les chaînes vides
         */
        @Query("SELECT u FROM User u WHERE " +
                        "(:role IS NULL OR u.role = :role) AND " +
                        "(:active IS NULL OR u.active = :active) AND " +
                        "(:emailVerified IS NULL OR u.emailVerified = :emailVerified) AND " +
                        "(:search IS NULL OR :search = '' OR " +
                        "(LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')))) " +
                        "ORDER BY u.createdAt DESC")
        Page<User> findAllUsersWithFilters(
                        @Param("role") UserRole role,
                        @Param("active") Boolean active,
                        @Param("emailVerified") Boolean emailVerified,
                        @Param("search") String search,
                        Pageable pageable);

        /**
         * Version SQL native pour une meilleure compatibilité avec PostgreSQL
         * Gère correctement les paramètres NULL et les chaînes vides
         * Utilise CONCAT() au lieu de || pour une meilleure compatibilité
         */
        @Query(value = "SELECT * FROM users u WHERE " +
                        "(:role IS NULL OR u.role = :role) AND " +
                        "(:active IS NULL OR u.active = :active) AND " +
                        "(:emailVerified IS NULL OR u.email_verified = :emailVerified) AND " +
                        "(:search IS NULL OR :search = '' OR (LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR "
                        +
                        "LOWER(u.full_name) LIKE LOWER(CONCAT('%', :search, '%')))) " +
                        "ORDER BY u.created_at DESC", countQuery = "SELECT COUNT(*) FROM users u WHERE " +
                                        "(:role IS NULL OR u.role = :role) AND " +
                                        "(:active IS NULL OR u.active = :active) AND " +
                                        "(:emailVerified IS NULL OR u.email_verified = :emailVerified) AND " +
                                        "(:search IS NULL OR :search = '' OR (LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR "
                                        +
                                        "LOWER(u.full_name) LIKE LOWER(CONCAT('%', :search, '%'))))", nativeQuery = true)
        Page<User> findAllUsersWithFiltersNative(
                        @Param("role") String role,
                        @Param("active") Boolean active,
                        @Param("emailVerified") Boolean emailVerified,
                        @Param("search") String search,
                        Pageable pageable);

        /**
         * Version SQL native alternative avec gestion améliorée des paramètres de
         * recherche
         * Plus robuste et compatible avec différents SGBD
         * Utilise ILIKE pour une recherche insensible à la casse (PostgreSQL)
         * IMPORTANT: On retire ORDER BY de la requête pour éviter les conflits avec
         * Pageable
         */
        @Query(value = "SELECT * FROM users u WHERE " +
                        "(:role IS NULL OR u.role = :role) AND " +
                        "(:active IS NULL OR u.active = :active) AND " +
                        "(:emailVerified IS NULL OR u.email_verified = :emailVerified) AND " +
                        "(:search IS NULL OR :search = '' OR " +
                        "u.email ILIKE :searchPattern OR u.full_name ILIKE :searchPattern)", countQuery = "SELECT COUNT(*) FROM users u WHERE "
                                        +
                                        "(:role IS NULL OR u.role = :role) AND " +
                                        "(:active IS NULL OR u.active = :active) AND " +
                                        "(:emailVerified IS NULL OR u.email_verified = :emailVerified) AND " +
                                        "(:search IS NULL OR :search = '' OR " +
                                        "u.email ILIKE :searchPattern OR u.full_name ILIKE :searchPattern)", nativeQuery = true)
        Page<User> findAllUsersWithFiltersImproved(
                        @Param("role") String role,
                        @Param("active") Boolean active,
                        @Param("emailVerified") Boolean emailVerified,
                        @Param("search") String search,
                        @Param("searchPattern") String searchPattern,
                        Pageable pageable);
}
