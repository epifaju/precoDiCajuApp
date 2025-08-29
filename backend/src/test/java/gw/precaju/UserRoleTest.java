package gw.precaju;

import gw.precaju.entity.enums.UserRole;

public class UserRoleTest {
    public static void main(String[] args) {
        System.out.println("=== Test UserRole Enum ===");
        
        // Test des valeurs de l'enumeration
        System.out.println("Valeurs disponibles:");
        for (UserRole role : UserRole.values()) {
            System.out.println("- " + role.name() + " -> " + role.getValue());
        }
        
        // Test de la methode fromString
        System.out.println("\nTest fromString:");
        try {
            UserRole contributor = UserRole.fromString("contributor");
            System.out.println("OK 'contributor' -> " + contributor.name());
        } catch (Exception e) {
            System.out.println("ERREUR avec 'contributor': " + e.getMessage());
        }
        
        try {
            UserRole admin = UserRole.fromString("admin");
            System.out.println("OK 'admin' -> " + admin.name());
        } catch (Exception e) {
            System.out.println("ERREUR avec 'admin': " + e.getMessage());
        }
        
        try {
            UserRole moderator = UserRole.fromString("moderator");
            System.out.println("OK 'moderator' -> " + moderator.name());
        } catch (Exception e) {
            System.out.println("ERREUR avec 'moderator': " + e.getMessage());
        }
        
        // Test de conversion directe
        System.out.println("\nTest conversion directe:");
        try {
            UserRole contributor = UserRole.valueOf("CONTRIBUTOR");
            System.out.println("OK UserRole.valueOf('CONTRIBUTOR') -> " + contributor.name());
        } catch (Exception e) {
            System.out.println("ERREUR avec UserRole.valueOf('CONTRIBUTOR'): " + e.getMessage());
        }
    }
}
