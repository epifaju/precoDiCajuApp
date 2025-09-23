package gw.precaju.controller;

import gw.precaju.dto.AuthResponse;
import gw.precaju.dto.request.LoginRequest;
import gw.precaju.dto.request.RefreshTokenRequest;
import gw.precaju.dto.request.RegisterRequest;
import gw.precaju.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import org.springframework.security.authentication.BadCredentialsException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("=== LOGIN REQUEST RECEIVED ===");
        logger.info("Email: {}", loginRequest.getEmail());
        logger.info("Password present: {}", loginRequest.getPassword() != null);
        logger.info("Password length: {}",
                loginRequest.getPassword() != null ? loginRequest.getPassword().length() : "N/A");
        logger.info("Remember me: {}", loginRequest.isRememberMe());

        try {
            AuthResponse response = authService.login(loginRequest);
            logger.info("✅ Login successful for user: {}", loginRequest.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("❌ Login failed for email: {}", loginRequest.getEmail());
            logger.error("Error type: {}", e.getClass().getSimpleName());
            logger.error("Error message: {}", e.getMessage());
            logger.error("Stack trace:", e);

            // Translate error message
            String translatedMessage = translateErrorMessage(e);

            // Return detailed error information
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed");
            errorResponse.put("message", translatedMessage);
            errorResponse.put("errorType", e.getClass().getSimpleName());
            errorResponse.put("timestamp", java.time.Instant.now());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse response = authService.register(registerRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Registration failed for email: {}", registerRequest.getEmail(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Token refresh failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request) {
        try {
            authService.logout(request.getRefreshToken());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Logout failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Translate error messages to English for consistent API responses
     */
    private String translateErrorMessage(Exception e) {
        if (e instanceof BadCredentialsException) {
            return "Bad credentials";
        }
        
        String message = e.getMessage();
        if (message != null) {
            // Translate common French error messages to English
            if (message.contains("Les identifications sont erronées")) {
                return "Bad credentials";
            }
            if (message.contains("Email ou mot de passe incorrect")) {
                return "Bad credentials";
            }
            if (message.contains("Utilisateur non trouvé")) {
                return "User not found";
            }
            if (message.contains("Compte désactivé")) {
                return "Account disabled";
            }
        }
        
        return message != null ? message : "Authentication failed";
    }
}
