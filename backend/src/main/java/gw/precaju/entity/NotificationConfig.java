package gw.precaju.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "seuil_pourcentage", precision = 5, scale = 2, nullable = false)
    private BigDecimal seuilPourcentage = BigDecimal.valueOf(10.0);

    @Column(name = "actif", nullable = false)
    private Boolean actif = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
}









