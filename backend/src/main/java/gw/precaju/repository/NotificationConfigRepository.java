package gw.precaju.repository;

import gw.precaju.entity.NotificationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationConfigRepository extends JpaRepository<NotificationConfig, UUID> {

    @Query("SELECT nc FROM NotificationConfig nc WHERE nc.actif = true ORDER BY nc.createdAt DESC")
    Optional<NotificationConfig> findActiveConfig();

    Optional<NotificationConfig> findByActifTrue();
}







