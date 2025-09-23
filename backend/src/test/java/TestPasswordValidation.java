import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPasswordValidation {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Hash trouvé dans la base de données pour admin@precaju.gw
        String dbHash = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf.";
        
        // Test différents mots de passe
        String[] passwords = {"admin123", "test123", "password123"};
        
        System.out.println("Testing password validation:");
        System.out.println("Database hash: " + dbHash);
        System.out.println();
        
        for (String password : passwords) {
            boolean matches = encoder.matches(password, dbHash);
            System.out.println("Password '" + password + "' matches: " + matches);
        }
        
        // Générer un nouveau hash pour test
        System.out.println("\nGenerating new hash for 'admin123':");
        String newHash = encoder.encode("admin123");
        System.out.println("New hash: " + newHash);
        System.out.println("New hash matches 'admin123': " + encoder.matches("admin123", newHash));
    }
}
