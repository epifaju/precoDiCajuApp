package gw.precaju.repository;

import gw.precaju.entity.User;
import gw.precaju.entity.enums.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    // Tests pour la méthode JPQL
    @Test
    public void testFindAllUsersWithFilters_WithNullParameters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<User> result = userRepository.findAllUsersWithFilters(
                null, null, null, null, pageable);

        // Then
        assertNotNull(result);
        assertTrue(result.getTotalElements() >= 0);
    }

    @Test
    public void testFindAllUsersWithFilters_WithRoleFilter() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<User> result = userRepository.findAllUsersWithFilters(
                UserRole.ADMIN, null, null, null, pageable);

        // Then
        assertNotNull(result);
        // Vérifier que tous les utilisateurs retournés ont le rôle ADMIN
        result.getContent().forEach(user -> assertEquals(UserRole.ADMIN, user.getRole()));
    }

    @Test
    public void testFindAllUsersWithFilters_WithActiveFilter() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<User> result = userRepository.findAllUsersWithFilters(
                null, true, null, null, pageable);

        // Then
        assertNotNull(result);
        // Vérifier que tous les utilisateurs retournés sont actifs
        result.getContent().forEach(user -> assertTrue(user.getActive()));
    }

    @Test
    public void testFindAllUsersWithFilters_WithSearchFilter() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        String searchTerm = "test";

        // When
        Page<User> result = userRepository.findAllUsersWithFilters(
                null, null, null, searchTerm, pageable);

        // Then
        assertNotNull(result);
        // Vérifier que les résultats contiennent le terme de recherche
        result.getContent().forEach(user -> {
            boolean containsSearch = user.getEmail().toLowerCase().contains(searchTerm.toLowerCase()) ||
                    (user.getFullName() != null &&
                            user.getFullName().toLowerCase().contains(searchTerm.toLowerCase()));
            assertTrue(containsSearch,
                    "User should contain search term: " + user.getEmail() + " / " + user.getFullName());
        });
    }

    @Test
    public void testFindAllUsersWithFilters_WithCombinedFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<User> result = userRepository.findAllUsersWithFilters(
                UserRole.CONTRIBUTOR, true, true, "test", pageable);

        // Then
        assertNotNull(result);
        // Vérifier que tous les utilisateurs retournés respectent tous les critères
        result.getContent().forEach(user -> {
            assertEquals(UserRole.CONTRIBUTOR, user.getRole());
            assertTrue(user.getActive());
            assertTrue(user.getEmailVerified());
            boolean containsSearch = user.getEmail().toLowerCase().contains("test") ||
                    (user.getFullName() != null &&
                            user.getFullName().toLowerCase().contains("test"));
            assertTrue(containsSearch);
        });
    }

    // Tests pour la méthode native SQL
    @Test
    public void testFindAllUsersWithFiltersNative_WithNullParameters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<User> result = userRepository.findAllUsersWithFiltersNative(
                null, null, null, null, pageable);

        // Then
        assertNotNull(result);
        assertTrue(result.getTotalElements() >= 0);
    }

    @Test
    public void testFindAllUsersWithFiltersNative_WithRoleFilter() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<User> result = userRepository.findAllUsersWithFiltersNative(
                "ADMIN", null, null, null, pageable);

        // Then
        assertNotNull(result);
        // Vérifier que tous les utilisateurs retournés ont le rôle ADMIN
        result.getContent().forEach(user -> assertEquals(UserRole.ADMIN, user.getRole()));
    }

    @Test
    public void testFindAllUsersWithFiltersNative_WithSearchFilter() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        String searchTerm = "test";

        // When
        Page<User> result = userRepository.findAllUsersWithFiltersNative(
                null, null, null, searchTerm, pageable);

        // Then
        assertNotNull(result);
        // Vérifier que les résultats contiennent le terme de recherche
        result.getContent().forEach(user -> {
            boolean containsSearch = user.getEmail().toLowerCase().contains(searchTerm.toLowerCase()) ||
                    (user.getFullName() != null &&
                            user.getFullName().toLowerCase().contains(searchTerm.toLowerCase()));
            assertTrue(containsSearch,
                    "User should contain search term: " + user.getEmail() + " / " + user.getFullName());
        });
    }

    @Test
    public void testFindAllUsersWithFiltersNative_WithEmptySearch() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<User> result = userRepository.findAllUsersWithFiltersNative(
                null, null, null, "", pageable);

        // Then
        assertNotNull(result);
        // Une recherche vide devrait retourner tous les utilisateurs
        assertTrue(result.getTotalElements() >= 0);
    }

    // Tests pour la méthode améliorée
    @Test
    public void testFindAllUsersWithFiltersImproved_WithNullParameters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<User> result = userRepository.findAllUsersWithFiltersImproved(
                null, null, null, null, null, pageable);

        // Then
        assertNotNull(result);
        assertTrue(result.getTotalElements() >= 0);
    }

    @Test
    public void testFindAllUsersWithFiltersImproved_WithSearchPattern() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        String searchPattern = "%test%";

        // When
        Page<User> result = userRepository.findAllUsersWithFiltersImproved(
                null, null, null, "test", searchPattern, pageable);

        // Then
        assertNotNull(result);
        // Vérifier que les résultats contiennent le terme de recherche
        result.getContent().forEach(user -> {
            boolean containsSearch = user.getEmail().toLowerCase().contains("test") ||
                    (user.getFullName() != null &&
                            user.getFullName().toLowerCase().contains("test"));
            assertTrue(containsSearch,
                    "User should contain search term: " + user.getEmail() + " / " + user.getFullName());
        });
    }

    @Test
    public void testFindAllUsersWithFiltersImproved_WithCombinedFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        String searchPattern = "%admin%";

        // When
        Page<User> result = userRepository.findAllUsersWithFiltersImproved(
                "ADMIN", true, true, "admin", searchPattern, pageable);

        // Then
        assertNotNull(result);
        // Vérifier que tous les utilisateurs retournés respectent tous les critères
        result.getContent().forEach(user -> {
            assertEquals(UserRole.ADMIN, user.getRole());
            assertTrue(user.getActive());
            assertTrue(user.getEmailVerified());
            boolean containsSearch = user.getEmail().toLowerCase().contains("admin") ||
                    (user.getFullName() != null &&
                            user.getFullName().toLowerCase().contains("admin"));
            assertTrue(containsSearch);
        });
    }
}
