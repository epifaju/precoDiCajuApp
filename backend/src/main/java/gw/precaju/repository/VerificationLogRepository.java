package gw.precaju.repository;

import gw.precaju.entity.VerificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationLogRepository extends JpaRepository<VerificationLog, UUID> {

    /**
     * Trouve tous les logs de vérification d'un exportateur
     */
    List<VerificationLog> findByExportateurIdOrderByVerificationTimeDesc(UUID exportateurId);

    /**
     * Trouve tous les logs de vérification d'un exportateur (paginé)
     */
    Page<VerificationLog> findByExportateurIdOrderByVerificationTimeDesc(UUID exportateurId, Pageable pageable);

    /**
     * Trouve tous les logs de vérification par résultat
     */
    List<VerificationLog> findByResultOrderByVerificationTimeDesc(String result);

    /**
     * Compte les vérifications par exportateur
     */
    @Query("SELECT v.exportateur.id, COUNT(v.id) FROM VerificationLog v GROUP BY v.exportateur.id ORDER BY COUNT(v.id) DESC")
    List<Object[]> countVerificationsByExportateur();

    /**
     * Trouve les logs de vérification récents (dernières 24h)
     */
    @Query("SELECT v FROM VerificationLog v WHERE v.verificationTime >= :since ORDER BY v.verificationTime DESC")
    List<VerificationLog> findRecentVerifications(@Param("since") Instant since);

    /**
     * Trouve les logs de vérification par période
     */
    @Query("SELECT v FROM VerificationLog v WHERE v.verificationTime BETWEEN :start AND :end ORDER BY v.verificationTime DESC")
    List<VerificationLog> findVerificationsBetween(@Param("start") Instant start, @Param("end") Instant end);

    /**
     * Compte les vérifications par résultat dans une période
     */
    @Query("SELECT v.result, COUNT(v.id) FROM VerificationLog v WHERE v.verificationTime BETWEEN :start AND :end GROUP BY v.result ORDER BY COUNT(v.id) DESC")
    List<Object[]> countVerificationsByResultBetween(@Param("start") Instant start, @Param("end") Instant end);

    /**
     * Trouve les IPs les plus actives pour les vérifications
     */
    @Query("SELECT v.ipAddress, COUNT(v.id) FROM VerificationLog v WHERE v.ipAddress IS NOT NULL GROUP BY v.ipAddress ORDER BY COUNT(v.id) DESC")
    List<Object[]> findMostActiveIPs();

    /**
     * Trouve les logs de vérification par session utilisateur
     */
    List<VerificationLog> findByUserSessionOrderByVerificationTimeDesc(String userSession);

    /**
     * Trouve les logs de vérification par adresse IP
     */
    List<VerificationLog> findByIpAddressOrderByVerificationTimeDesc(String ipAddress);

    /**
     * Compte le nombre total de vérifications
     */
    long count();

    /**
     * Compte les vérifications par résultat
     */
    long countByResult(String result);

    /**
     * Trouve les statistiques de vérification par exportateur
     */
    @Query("SELECT v.exportateur.id, v.exportateur.nom, COUNT(v.id) as totalVerifications, " +
           "COUNT(CASE WHEN v.result = 'SUCCESS' THEN 1 END) as successfulVerifications " +
           "FROM VerificationLog v GROUP BY v.exportateur.id, v.exportateur.nom ORDER BY totalVerifications DESC")
    List<Object[]> getVerificationStatsByExportateur();
}
