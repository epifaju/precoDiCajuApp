package gw.precaju.entity.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserRoleConverter implements AttributeConverter<UserRole, String> {

    @Override
    public String convertToDatabaseColumn(UserRole attribute) {
        return attribute != null ? attribute.getValue() : null;
    }

    @Override
    public UserRole convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        
        // Gestion directe des valeurs de la base de données
        try {
            // Essayer d'abord la conversion directe par nom d'énumération
            return UserRole.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Si ça échoue, utiliser la méthode fromString qui gère les valeurs
            try {
                return UserRole.fromString(dbData);
            } catch (IllegalArgumentException e2) {
                // En dernier recours, essayer de faire correspondre les valeurs
                for (UserRole role : UserRole.values()) {
                    if (role.getValue().equalsIgnoreCase(dbData)) {
                        return role;
                    }
                }
                // Si rien ne correspond, retourner le rôle par défaut
                return UserRole.CONTRIBUTOR;
            }
        }
    }
}
