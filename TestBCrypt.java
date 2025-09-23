import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBCrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "admin123";
        String hashFromDB = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf6";
        
        System.out.println("Password: " + password);
        System.out.println("Hash from DB: " + hashFromDB);
        System.out.println("Hash length: " + hashFromDB.length());
        System.out.println("Matches: " + encoder.matches(password, hashFromDB));
        
        // Générer un nouveau hash pour comparaison
        String newHash = encoder.encode(password);
        System.out.println("New hash: " + newHash);
        System.out.println("New hash matches: " + encoder.matches(password, newHash));
    }
}
