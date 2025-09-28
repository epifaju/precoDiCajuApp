package gw.precaju.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSubscriptionDTO {

    @NotNull(message = "Push subscription is required")
    private String pushSubscription;

    private Boolean prixVariations = true;
    private Double seuilPersonnalise;

    // Helper method to check if user wants price variation notifications
    public boolean wantsPrixVariations() {
        return prixVariations != null && prixVariations;
    }
}









