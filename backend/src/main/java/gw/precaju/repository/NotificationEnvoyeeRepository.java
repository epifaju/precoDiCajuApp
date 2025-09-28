package gw.precaju.repository;

import gw.precaju.entity.NotificationEnvoyee;
import gw.precaju.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationEnvoyeeRepository extends JpaRepository<NotificationEnvoyee, UUID> {

    Page<NotificationEnvoyee> findByUtilisateurOrderByCreatedAtDesc(User user, Pageable pageable);

    List<NotificationEnvoyee> findByUtilisateurAndCreatedAtAfter(User user, ZonedDateTime since);

    @Query("SELECT ne FROM NotificationEnvoyee ne WHERE ne.utilisateur = :user AND ne.createdAt >= :since ORDER BY ne.createdAt DESC")
    List<NotificationEnvoyee> findRecentNotificationsForUser(@Param("user") User user,
            @Param("since") ZonedDateTime since);

    long countByUtilisateurAndStatut(User user, NotificationEnvoyee.NotificationStatut statut);

    @Query("SELECT COUNT(ne) FROM NotificationEnvoyee ne WHERE ne.utilisateur = :user AND ne.createdAt >= :since")
    long countNotificationsSince(@Param("user") User user, @Param("since") ZonedDateTime since);
}









