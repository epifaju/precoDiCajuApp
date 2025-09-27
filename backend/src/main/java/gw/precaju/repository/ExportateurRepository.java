package gw.precaju.repository;

import gw.precaju.entity.Exportateur;
import gw.precaju.entity.enums.ExportateurType;
import gw.precaju.entity.enums.StatutType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExportateurRepository extends JpaRepository<Exportateur, UUID>, JpaSpecificationExecutor<Exportateur> {

    /**
     * Trouve un exportateur par son token QR code
     */
    Optional<Exportateur> findByQrCodeToken(String qrCodeToken);

    /**
     * Trouve un exportateur par son numéro d'agrément
     */
    Optional<Exportateur> findByNumeroAgrement(String numeroAgrement);

    /**
     * Trouve tous les exportateurs actifs
     */
    List<Exportateur> findByStatutOrderByNomAsc(StatutType statut);

    /**
     * Trouve tous les exportateurs d'une région
     */
    @Query("SELECT e FROM Exportateur e WHERE e.region.code = :regionCode ORDER BY e.nom ASC")
    List<Exportateur> findByRegionCodeOrderByNomAsc(@Param("regionCode") String regionCode);

    /**
     * Trouve tous les exportateurs d'un type donné
     */
    List<Exportateur> findByTypeOrderByNomAsc(ExportateurType type);

    /**
     * Trouve tous les exportateurs actifs d'une région
     */
    @Query("SELECT e FROM Exportateur e WHERE e.region.code = :regionCode AND e.statut = :statut ORDER BY e.nom ASC")
    List<Exportateur> findByRegionCodeAndStatutOrderByNomAsc(@Param("regionCode") String regionCode, @Param("statut") StatutType statut);

    /**
     * Trouve tous les exportateurs actifs d'un type donné dans une région
     */
    @Query("SELECT e FROM Exportateur e WHERE e.region.code = :regionCode AND e.type = :type AND e.statut = :statut ORDER BY e.nom ASC")
    List<Exportateur> findByRegionCodeAndTypeAndStatutOrderByNomAsc(
            @Param("regionCode") String regionCode, @Param("type") ExportateurType type, @Param("statut") StatutType statut);

    /**
     * Recherche par nom (insensible à la casse)
     */
    @Query("SELECT e FROM Exportateur e WHERE e.nom LIKE CONCAT('%', :nom, '%') ORDER BY e.nom ASC")
    List<Exportateur> findByNomContainingIgnoreCase(@Param("nom") String nom);

    /**
     * Recherche paginée avec filtres - méthode simplifiée sans enum
     */
    @Query("SELECT e FROM Exportateur e WHERE " +
           "(:regionCode IS NULL OR e.region.code = :regionCode) AND " +
           "(:nom IS NULL OR e.nom LIKE CONCAT('%', :nom, '%'))")
    Page<Exportateur> findWithBasicFilters(
            @Param("regionCode") String regionCode,
            @Param("nom") String nom,
            Pageable pageable);

    /**
     * Méthode de test simple - récupère tous les exportateurs sans filtres
     */
    @Query("SELECT e FROM Exportateur e")
    Page<Exportateur> findAllSimple(Pageable pageable);

    /**
     * Trouve les exportateurs expirant bientôt (dans les 30 prochains jours)
     */
    @Query("SELECT e FROM Exportateur e WHERE e.dateExpiration BETWEEN :today AND :expirationDate ORDER BY e.dateExpiration ASC")
    List<Exportateur> findExpiringSoon(@Param("today") LocalDate today, @Param("expirationDate") LocalDate expirationDate);

    /**
     * Trouve les exportateurs expirés
     */
    @Query("SELECT e FROM Exportateur e WHERE e.dateExpiration < :today AND e.statut != 'EXPIRE' ORDER BY e.dateExpiration DESC")
    List<Exportateur> findExpired(@Param("today") LocalDate today);

    /**
     * Compte les exportateurs par région et statut
     */
    @Query("SELECT e.region.code, e.statut, COUNT(e) FROM Exportateur e GROUP BY e.region.code, e.statut ORDER BY e.region.code, e.statut")
    List<Object[]> countByRegionAndStatut();

    /**
     * Compte les exportateurs par type et statut
     */
    @Query("SELECT e.type, e.statut, COUNT(e) FROM Exportateur e GROUP BY e.type, e.statut ORDER BY e.type, e.statut")
    List<Object[]> countByTypeAndStatut();

    /**
     * Trouve les exportateurs les plus vérifiés (par nombre de logs de vérification)
     */
    @Query("SELECT e, COUNT(v.id) as verificationCount FROM Exportateur e LEFT JOIN e.verificationLogs v " +
           "GROUP BY e.id ORDER BY verificationCount DESC")
    Page<Object[]> findMostVerified(Pageable pageable);

    /**
     * Vérifie l'existence d'un numéro d'agrément (pour validation)
     */
    boolean existsByNumeroAgrement(String numeroAgrement);

    /**
     * Vérifie l'existence d'un token QR code (pour validation)
     */
    boolean existsByQrCodeToken(String qrCodeToken);

}
