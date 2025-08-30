package gw.precaju.service;

import gw.precaju.entity.User;
import gw.precaju.entity.enums.UserRole;
import gw.precaju.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
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

            // Nettoyer et valider les paramètres
            String cleanSearch = cleanSearchParameter(search);
            String roleString = cleanRoleParameter(role);
            String searchPattern = createSearchPattern(cleanSearch);

            logger.debug(
                    "Cleaned parameters - roleString: {}, active: {}, emailVerified: {}, cleanSearch: {}, searchPattern: {}",
                    roleString, active, emailVerified, cleanSearch, searchPattern);

            // Nettoyer le Pageable pour éviter les conflits avec les noms de colonnes SQL natives
            Pageable cleanPageable = createCleanPageable(pageable);
            
            // Utiliser la méthode native SQL améliorée du repository
            Page<User> result = userRepository.findAllUsersWithFiltersImproved(roleString, active, emailVerified,
                    cleanSearch, searchPattern, cleanPageable);
            logger.info("Successfully retrieved {} users with filters", result.getTotalElements());
            return result;

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument in findAllUsersWithFilters: {}", e.getMessage(), e);
            throw e;
        } catch (org.springframework.dao.DataAccessException e) {
            logger.error("Database access error in findAllUsersWithFilters: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                logger.error("Root cause: {}", e.getCause().getMessage());
                logger.error("Root cause class: {}", e.getCause().getClass().getSimpleName());
            }
            throw new RuntimeException("Database error while retrieving users: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error in findAllUsersWithFilters: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve users with filters: " + e.getMessage(), e);
        }
    }

    /**
     * Nettoie et valide le paramètre de recherche
     */
    private String cleanSearchParameter(String search) {
        if (search == null) {
            return null;
        }

        String trimmed = search.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        // Limiter la longueur pour éviter les attaques par déni de service
        if (trimmed.length() > 100) {
            logger.warn("Search term too long ({} chars), truncating to 100 characters", trimmed.length());
            return trimmed.substring(0, 100);
        }

        return trimmed;
    }

    /**
     * Nettoie et valide le paramètre de rôle
     */
    private String cleanRoleParameter(String role) {
        if (role == null || role.trim().isEmpty()) {
            return null;
        }

        try {
            // Valider que le rôle est valide
            UserRole.valueOf(role.toUpperCase());
            return role.toUpperCase();
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid role parameter: {}, ignoring role filter", role);
            return null;
        }
    }

    /**
     * Crée le pattern de recherche pour la méthode SQL native
     * Utilise ILIKE avec % pour une recherche insensible à la casse
     */
    private String createSearchPattern(String search) {
        if (search == null || search.isEmpty()) {
            return null;
        }
        return "%" + search + "%";
    }

    /**
     * Nettoie le Pageable pour éviter les conflits avec les noms de colonnes SQL natives
     * Convertit les noms de propriétés camelCase vers snake_case
     */
    private Pageable createCleanPageable(Pageable pageable) {
        if (pageable == null || pageable.getSort().isUnsorted()) {
            // Si pas de tri, utiliser un tri par défaut par created_at DESC
            return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), 
                                Sort.by("created_at").descending());
        }

        // Mapper les noms de propriétés camelCase vers snake_case pour PostgreSQL
        List<Sort.Order> orders = new ArrayList<>();
        for (Sort.Order order : pageable.getSort()) {
            String property = order.getProperty();
            
            // Conversion des noms de propriétés
            switch (property) {
                case "createdAt":
                    property = "created_at";
                    break;
                case "updatedAt":
                    property = "updated_at";
                    break;
                case "fullName":
                    property = "full_name";
                    break;
                case "emailVerified":
                    property = "email_verified";
                    break;
                case "reputationScore":
                    property = "reputation_score";
                    break;
                case "lastLoginAt":
                    property = "last_login_at";
                    break;
                case "preferredRegions":
                    property = "preferred_regions";
                    break;
                case "notificationPreferences":
                    property = "notification_preferences";
                    break;
                // Les autres propriétés restent inchangées (id, email, role, active, etc.)
                default:
                    // Conserver la propriété telle quelle
                    break;
            }
            
            orders.add(new Sort.Order(order.getDirection(), property));
        }

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
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
