package gw.precaju.controller;

import gw.precaju.dto.PageResponse;
import gw.precaju.dto.UserDTO;
import gw.precaju.dto.request.AdminUpdateUserRequest;
import gw.precaju.dto.request.CreateUserRequest;
import gw.precaju.entity.User;
import gw.precaju.entity.enums.UserRole;
import gw.precaju.mapper.UserMapper;
import gw.precaju.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final UserService userService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserService userService, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Récupère tous les utilisateurs avec pagination et filtres
     */
    @GetMapping
    public ResponseEntity<PageResponse<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean emailVerified,
            @RequestParam(required = false) String search) {

        logger.info("=== ADMIN: getAllUsers called ===");
        logger.info(
                "Parameters - page: {}, size: {}, sortBy: {}, sortDir: {}, role: {}, active: {}, emailVerified: {}, search: {}",
                page, size, sortBy, sortDir, role, active, emailVerified, search);

        try {
            // Validation des paramètres
            validatePaginationParameters(page, size);

            // Validation du paramètre role
            if (role != null && !role.trim().isEmpty()) {
                if (!isValidRoleParameter(role)) {
                    logger.warn("Invalid role parameter: {}, ignoring role filter", role);
                    role = null; // Ignorer le filtre de rôle invalide
                }
            }

            // Validation du champ de tri
            if (!isValidSortField(sortBy)) {
                logger.warn("Invalid sort field: {}, using default 'createdAt'", sortBy);
                sortBy = "createdAt";
            }

            Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            logger.debug("Created Pageable: {}", pageable);

            // Récupération des utilisateurs avec filtres
            logger.debug("Calling userService.findAllUsersWithFilters");
            Page<User> usersPage = userService.findAllUsersWithFilters(role, active, emailVerified, search, pageable);
            logger.info("Retrieved {} users from database", usersPage.getTotalElements());

            // Conversion en DTOs
            logger.debug("Converting users to DTOs");
            Page<UserDTO> userDTOsPage = usersPage.map(userMapper::toDTO);

            PageResponse<UserDTO> response = PageResponse.of(userDTOsPage);
            logger.info("Successfully created response with {} users", response.getContent().size());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument in getAllUsers request: {}", e.getMessage(), e);
            return createErrorResponse("VALIDATION_ERROR", e.getMessage(), 400);
        } catch (org.springframework.dao.InvalidDataAccessApiUsageException e) {
            logger.error("Invalid data access API usage in getAllUsers request: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                logger.error("Root cause: {}", e.getCause().getMessage());
                logger.error("Root cause class: {}", e.getCause().getClass().getSimpleName());
            }
            return createErrorResponse("DATABASE_ERROR", "Erreur de paramètres de base de données", 400);
        } catch (org.springframework.orm.jpa.JpaSystemException e) {
            logger.error("JPA system error in getAllUsers request: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                logger.error("Root cause: {}", e.getCause().getMessage());
                logger.error("Root cause class: {}", e.getCause().getClass().getSimpleName());
            }
            return createErrorResponse("DATABASE_ERROR", "Erreur de système de base de données", 503);
        } catch (org.springframework.dao.DataAccessException e) {
            logger.error("Database access error in getAllUsers request: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                logger.error("Root cause: {}", e.getCause().getMessage());
                logger.error("Root cause class: {}", e.getCause().getClass().getSimpleName());
            }
            return createErrorResponse("DATABASE_ERROR", "Service temporairement indisponible", 503);
        } catch (RuntimeException e) {
            logger.error("Runtime error in getAllUsers request: {}", e.getMessage(), e);
            // Log plus détaillé pour les erreurs runtime
            if (e.getCause() != null) {
                logger.error("Root cause: {}", e.getCause().getMessage());
                logger.error("Root cause class: {}", e.getCause().getClass().getSimpleName());
            }
            return createErrorResponse("RUNTIME_ERROR", "Erreur interne du serveur", 500);
        } catch (Exception e) {
            logger.error("Unexpected error in getAllUsers request: {}", e.getMessage(), e);
            // Log de la stack trace complète pour le débogage
            logger.error("Full stack trace:", e);
            return createErrorResponse("UNEXPECTED_ERROR", "Erreur inattendue du serveur", 500);
        }
    }

    /**
     * Récupère un utilisateur par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        try {
            User user = userService.findById(id);
            UserDTO userDTO = userMapper.toDTO(user);
            return ResponseEntity.ok(userDTO);

        } catch (RuntimeException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error retrieving user with ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Crée un nouvel utilisateur
     */
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            // Vérifier si l'email existe déjà
            if (userService.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().build();
            }

            // Créer l'utilisateur
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setPhone(request.getPhone());
            user.setRole(request.getRole() != null ? request.getRole() : UserRole.CONTRIBUTOR);
            user.setReputationScore(0);
            user.setEmailVerified(request.getEmailVerified() != null ? request.getEmailVerified() : false);
            user.setActive(request.getActive() != null ? request.getActive() : true);

            User savedUser = userService.save(user);
            UserDTO userDTO = userMapper.toDTO(savedUser);

            logger.info("User created successfully: {}", user.getEmail());
            return ResponseEntity.ok(userDTO);

        } catch (Exception e) {
            logger.error("Error creating user", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Met à jour un utilisateur existant
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable UUID id,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        try {
            User user = userService.findById(id);

            // Mise à jour des champs
            if (request.getFullName() != null) {
                user.setFullName(request.getFullName());
            }
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone());
            }
            if (request.getRole() != null) {
                user.setRole(request.getRole());
            }
            if (request.getReputationScore() != null) {
                user.setReputationScore(request.getReputationScore());
            }
            if (request.getEmailVerified() != null) {
                user.setEmailVerified(request.getEmailVerified());
            }
            if (request.getActive() != null) {
                user.setActive(request.getActive());
            }
            if (request.getPreferredRegions() != null) {
                userMapper.updateEntityFromDTO(
                        createUserDTOFromRequest(request), user);
            }

            User updatedUser = userService.save(user);
            UserDTO userDTO = userMapper.toDTO(updatedUser);

            logger.info("User updated successfully: {}", user.getEmail());
            return ResponseEntity.ok(userDTO);

        } catch (RuntimeException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating user with ID: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Désactive un utilisateur (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        try {
            User user = userService.findById(id);
            user.setActive(false);
            userService.save(user);

            logger.info("User deactivated successfully: {}", user.getEmail());
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deactivating user with ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Réactive un utilisateur
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<UserDTO> activateUser(@PathVariable UUID id) {
        try {
            User user = userService.findById(id);
            user.setActive(true);
            User savedUser = userService.save(user);
            UserDTO userDTO = userMapper.toDTO(savedUser);

            logger.info("User activated successfully: {}", user.getEmail());
            return ResponseEntity.ok(userDTO);

        } catch (RuntimeException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error activating user with ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Change le mot de passe d'un utilisateur
     */
    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changeUserPassword(@PathVariable UUID id, @RequestBody ChangePasswordRequest request) {
        try {
            User user = userService.findById(id);
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            userService.save(user);

            logger.info("Password changed successfully for user: {}", user.getEmail());
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error changing password for user with ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupère les statistiques des utilisateurs
     */
    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStats() {
        logger.info("=== ADMIN: getUserStats called ===");
        try {
            logger.debug("Counting total users");
            long totalUsers = userService.countAllUsers();
            logger.debug("Counting active users");
            long activeUsers = userService.countByRoleAndActiveTrue(null);
            logger.debug("Counting admin users");
            long adminUsers = userService.countByRoleAndActiveTrue(UserRole.ADMIN);
            logger.debug("Counting moderator users");
            long moderatorUsers = userService.countByRoleAndActiveTrue(UserRole.MODERATOR);
            logger.debug("Counting contributor users");
            long contributorUsers = userService.countByRoleAndActiveTrue(UserRole.CONTRIBUTOR);

            UserStatsDTO stats = new UserStatsDTO();
            stats.setTotalUsers(totalUsers);
            stats.setActiveUsers(activeUsers);
            stats.setAdminUsers(adminUsers);
            stats.setModeratorUsers(moderatorUsers);
            stats.setContributorUsers(contributorUsers);

            logger.info(
                    "Successfully retrieved user stats: Total={}, Active={}, Admin={}, Moderator={}, Contributor={}",
                    totalUsers, activeUsers, adminUsers, moderatorUsers, contributorUsers);
            return ResponseEntity.ok(stats);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument in getUserStats request: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            logger.error("Runtime error in getUserStats request: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            logger.error("Unexpected error in getUserStats request: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper methods
    private boolean isValidSortField(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return false;
        }

        // Liste des champs valides pour le tri
        String[] validFields = { "id", "email", "fullName", "role", "active", "emailVerified", "createdAt", "updatedAt",
                "lastLoginAt" };

        for (String validField : validFields) {
            if (validField.equalsIgnoreCase(sortBy.trim())) {
                return true;
            }
        }

        return false;
    }

    private boolean isValidRoleParameter(String role) {
        try {
            UserRole.valueOf(role.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Crée une réponse d'erreur avec des détails
     */
    private ResponseEntity<PageResponse<UserDTO>> createErrorResponse(String errorType, String message,
            int statusCode) {
        logger.error("{}: {}", errorType, message);
        return ResponseEntity.status(statusCode).build();
    }

    private void validatePaginationParameters(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be non-negative");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be positive");
        }
        if (size > 100) {
            throw new IllegalArgumentException("Page size cannot exceed 100");
        }
    }

    private UserDTO createUserDTOFromRequest(AdminUpdateUserRequest request) {
        UserDTO dto = new UserDTO();
        dto.setPreferredRegions(request.getPreferredRegions());
        return dto;
    }

    // Inner classes for requests
    public static class ChangePasswordRequest {
        private String newPassword;

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    public static class ErrorResponse {
        private String error;
        private String message;
        private String timestamp;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
            this.timestamp = java.time.Instant.now().toString();
        }

        // Getters
        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }

        public String getTimestamp() {
            return timestamp;
        }
    }

    public static class UserStatsDTO {
        private long totalUsers;
        private long activeUsers;
        private long adminUsers;
        private long moderatorUsers;
        private long contributorUsers;

        // Getters and Setters
        public long getTotalUsers() {
            return totalUsers;
        }

        public void setTotalUsers(long totalUsers) {
            this.totalUsers = totalUsers;
        }

        public long getActiveUsers() {
            return activeUsers;
        }

        public void setActiveUsers(long activeUsers) {
            this.activeUsers = activeUsers;
        }

        public long getAdminUsers() {
            return adminUsers;
        }

        public void setAdminUsers(long adminUsers) {
            this.adminUsers = adminUsers;
        }

        public long getModeratorUsers() {
            return moderatorUsers;
        }

        public void setModeratorUsers(long moderatorUsers) {
            this.moderatorUsers = moderatorUsers;
        }

        public long getContributorUsers() {
            return contributorUsers;
        }

        public void setContributorUsers(long contributorUsers) {
            this.contributorUsers = contributorUsers;
        }
    }
}
