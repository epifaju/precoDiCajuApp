package gw.precaju.service;

import gw.precaju.entity.User;
import gw.precaju.entity.enums.UserRole;
import gw.precaju.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return user;
    }

    @Transactional(readOnly = true)
    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void updateLastLogin(String email) {
        User user = findByEmail(email);
        user.updateLastLogin();
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Page<User> findAllActive(Pageable pageable) {
        return userRepository.findByActiveTrue(pageable);
    }

    // Méthodes d'administration
    @Transactional(readOnly = true)
    public Page<User> findAllUsersWithFilters(String role, Boolean active, Boolean emailVerified, String search,
            Pageable pageable) {
        try {
            logger.debug(
                    "UserService.findAllUsersWithFilters called with role: {}, active: {}, emailVerified: {}, search: {}, pageable: {}",
                    role, active, emailVerified, search, pageable);

            // Validation des paramètres de recherche
            if (search != null && search.trim().length() > 100) {
                logger.warn("Search term too long ({} chars), truncating to 100 characters", search.length());
                search = search.trim().substring(0, 100);
            }

            // Conversion du paramètre role de String vers UserRole
            UserRole userRole = null;
            if (role != null && !role.trim().isEmpty()) {
                try {
                    userRole = UserRole.valueOf(role.toUpperCase());
                    logger.debug("Converted role parameter: {} -> {}", role, userRole);
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid role parameter: {}, ignoring role filter", role);
                }
            }

            logger.debug("Calling repository with userRole: {}, active: {}, emailVerified: {}, search: {}",
                    userRole, active, emailVerified, search);

            // Essayer d'abord la méthode JPQL
            try {
                Page<User> result = userRepository.findAllUsersWithFilters(userRole, active, emailVerified, search,
                        pageable);
                logger.info("Successfully retrieved {} users with filters using JPQL", result.getTotalElements());
                return result;
            } catch (Exception jpqlException) {
                logger.warn("JPQL query failed, falling back to native SQL: {}", jpqlException.getMessage());

                // Fallback vers la requête native
                String roleString = userRole != null ? userRole.name() : null;
                Page<User> result = userRepository.findAllUsersWithFiltersNative(roleString, active, emailVerified,
                        search, pageable);
                logger.info("Successfully retrieved {} users with filters using native SQL", result.getTotalElements());
                return result;
            }

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument in findAllUsersWithFilters: {}", e.getMessage(), e);
            throw e; // Re-lancer l'exception pour la gestion appropriée dans le controller
        } catch (org.springframework.dao.DataAccessException e) {
            logger.error("Database access error in findAllUsersWithFilters: {}", e.getMessage(), e);
            // Log plus détaillé pour les erreurs de base de données
            if (e.getCause() != null) {
                logger.error("Root cause: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("Database error while retrieving users: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error in findAllUsersWithFilters: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve users with filters: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public long countAllUsers() {
        try {
            logger.debug("UserService.countAllUsers called");
            long count = userRepository.count();
            logger.debug("Total users count: {}", count);
            return count;
        } catch (Exception e) {
            logger.error("Error in countAllUsers: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to count users: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public long countByRoleAndActiveTrue(UserRole role) {
        try {
            logger.debug("UserService.countByRoleAndActiveTrue called with role: {}", role);
            long count;
            if (role == null) {
                count = userRepository.countByActiveTrue();
                logger.debug("Active users count: {}", count);
            } else {
                count = userRepository.countByRoleAndActiveTrue(role);
                logger.debug("Active users count for role {}: {}", role, count);
            }
            return count;
        } catch (Exception e) {
            logger.error("Error in countByRoleAndActiveTrue: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to count users by role and active status: " + e.getMessage(), e);
        }
    }

    /**
     * Valide si un rôle est valide
     */
    private boolean isValidRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }

        try {
            UserRole.valueOf(role.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
