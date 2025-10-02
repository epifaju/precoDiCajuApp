package gw.precaju.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications_envoyees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEnvoyee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prix_id", nullable = false)
    private Price prix;

    @Column(name = "ancien_prix", precision = 10, scale = 2, nullable = false)
    private BigDecimal ancienPrix;

    @Column(name = "nouveau_prix", precision = 10, scale = 2, nullable = false)
    private BigDecimal nouveauPrix;

    @Column(name = "variation_pourcentage", precision = 5, scale = 2, nullable = false)
    private BigDecimal variationPourcentage;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private NotificationStatut statut = NotificationStatut.ENVOYEE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    public enum NotificationStatut {
        ENVOYEE, ECHEC, EN_ATTENTE
    }
}












