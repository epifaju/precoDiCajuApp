package gw.precaju.controller;

import gw.precaju.dto.PageResponse;
import gw.precaju.dto.UserDTO;
import gw.precaju.dto.request.UpdateUserRequest;
import gw.precaju.entity.User;
import gw.precaju.mapper.UserMapper;
import gw.precaju.service.AuthService;
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
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;
import gw.precaju.dto.request.ChangePasswordRequest;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final AuthService authService;
    private final UserMapper userMapper;

    public UserController(UserService userService, AuthService authService, UserMapper userMapper) {
        this.userService = userService;
        this.authService = authService;
        this.userMapper = userMapper;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'CONTRIBUTOR')")
    public ResponseEntity<UserDTO> getCurrentUser() {
        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            UserDTO userDTO = userMapper.toDTO(currentUser);
            return ResponseEntity.ok(userDTO);

        } catch (Exception e) {
            logger.error("Error retrieving current user", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'CONTRIBUTOR')")
    public ResponseEntity<UserDTO> updateCurrentUser(@Valid @RequestBody UpdateUserRequest request) {
        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            // Update user fields
            if (request.getFullName() != null) {
                currentUser.setFullName(request.getFullName());
            }
            if (request.getPhone() != null) {
                currentUser.setPhone(request.getPhone());
            }
            if (request.getPreferredRegions() != null) {
                // Convert list to JSON and update
                userMapper.updateEntityFromDTO(
                        createUserDTOFromRequest(request), currentUser);
            }

            User updatedUser = userService.save(currentUser);
            UserDTO userDTO = userMapper.toDTO(updatedUser);

            return ResponseEntity.ok(userDTO);

        } catch (Exception e) {
            logger.error("Error updating current user", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/me/change-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'CONTRIBUTOR')")
    public ResponseEntity<Void> changeCurrentUserPassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            // Verify current password
            if (!authService.verifyPassword(request.getCurrentPassword(), currentUser.getPasswordHash())) {
                return ResponseEntity.badRequest().build();
            }

            // Update password
            currentUser.setPasswordHash(authService.encodePassword(request.getNewPassword()));
            userService.save(currentUser);

            logger.info("Password changed successfully for user: {}", currentUser.getEmail());
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            logger.error("Error changing password for current user", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        try {
            if (size > 100)
                size = 100;
            if (page < 0)
                page = 0;

            Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<User> users = userService.findAllActive(pageable);

            Page<UserDTO> userDTOs = users.map(userMapper::toDTO);
            return ResponseEntity.ok(PageResponse.of(userDTOs));

        } catch (Exception e) {
            logger.error("Error retrieving users", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> activateUser(@PathVariable UUID id) {
        try {
            User user = userService.findById(id);
            user.setActive(true);

            User updatedUser = userService.save(user);
            UserDTO userDTO = userMapper.toDTO(updatedUser);

            logger.info("User {} activated by admin", user.getEmail());
            return ResponseEntity.ok(userDTO);

        } catch (RuntimeException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error activating user with ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> deactivateUser(@PathVariable UUID id) {
        try {
            User currentUser = authService.getCurrentUser();
            User targetUser = userService.findById(id);

            // Prevent self-deactivation
            if (currentUser.getId().equals(targetUser.getId())) {
                return ResponseEntity.badRequest().build();
            }

            targetUser.setActive(false);

            User updatedUser = userService.save(targetUser);
            UserDTO userDTO = userMapper.toDTO(updatedUser);

            logger.info("User {} deactivated by admin {}", targetUser.getEmail(), currentUser.getEmail());
            return ResponseEntity.ok(userDTO);

        } catch (RuntimeException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deactivating user with ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        try {
            User currentUser = authService.getCurrentUser();
            User targetUser = userService.findById(id);

            // Prevent self-deletion
            if (currentUser.getId().equals(targetUser.getId())) {
                return ResponseEntity.badRequest().build();
            }

            // Soft delete by deactivating
            targetUser.setActive(false);
            userService.save(targetUser);

            logger.info("User {} deleted by admin {}", targetUser.getEmail(), currentUser.getEmail());
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting user with ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private UserDTO createUserDTOFromRequest(UpdateUserRequest request) {
        UserDTO dto = new UserDTO();
        dto.setFullName(request.getFullName());
        dto.setPhone(request.getPhone());
        dto.setPreferredRegions(request.getPreferredRegions());
        return dto;
    }
}
