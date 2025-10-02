package gw.precaju.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationHistoryDTO {

    private UUID id;
    private UUID prixId;
    private String regionCode;
    private String qualityGrade;
    private BigDecimal ancienPrix;
    private BigDecimal nouveauPrix;
    private BigDecimal variationPourcentage;
    private String message;
    private String statut;
    private ZonedDateTime createdAt;
}












