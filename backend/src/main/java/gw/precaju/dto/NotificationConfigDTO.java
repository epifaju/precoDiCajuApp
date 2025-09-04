package gw.precaju.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationConfigDTO {

    private UUID id;

    @NotNull(message = "Seuil pourcentage is required")
    @DecimalMin(value = "0.1", message = "Seuil pourcentage must be at least 0.1%")
    private BigDecimal seuilPourcentage;

    @NotNull(message = "Actif status is required")
    private Boolean actif;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}

