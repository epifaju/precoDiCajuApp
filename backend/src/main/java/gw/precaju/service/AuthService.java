package gw.precaju.service;

import gw.precaju.dto.AuthResponse;
import gw.precaju.dto.UserDTO;
import gw.precaju.dto.request.LoginRequest;
import gw.precaju.dto.request.RegisterRequest;
import gw.precaju.dto.request.RefreshTokenRequest;
import gw.precaju.entity.RefreshToken;
import gw.precaju.entity.User;
import gw.precaju.entity.enums.UserRole;
import gw.precaju.mapper.UserMapper;
import gw.precaju.repository.RefreshTokenRepository;
import gw.precaju.repository.UserRepository;
import gw.precaju.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    public AuthService(AuthenticationManager authenticationManager,
                      UserRepository userRepository,
                      RefreshTokenRepository refreshTokenRepository,
                      PasswordEncoder passwordEncoder,
                      JwtTokenProvider tokenProvider,
                      UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Get user
        User user = userRepository.findByEmailAndActiveTrue(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Update last login
        user.updateLastLogin();
        userRepository.save(user);

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        // Save refresh token
        saveRefreshToken(user, refreshToken);

        // Clean old tokens if needed
        cleanupOldTokensForUser(user);

        UserDTO userDTO = userMapper.toDTO(user);

        logger.info("User {} logged in successfully", user.getEmail());

        return new AuthResponse(
            accessToken,
            refreshToken,
            tokenProvider.getAccessTokenExpirationMs(),
            userDTO
        );
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        logger.info("Registration attempt for email: {}", registerRequest.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        // Create new user
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        user.setPhone(registerRequest.getPhone());
        user.setRole(UserRole.CONTRIBUTOR);
        user.setEmailVerified(false); // In production, require email verification
        user.setActive(true);

        user = userRepository.save(user);

        // Auto-login after registration
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            user.getEmail(),
            registerRequest.getPassword()
        );

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        // Save refresh token
        saveRefreshToken(user, refreshToken);

        UserDTO userDTO = userMapper.toDTO(user);

        logger.info("User {} registered successfully", user.getEmail());

        return new AuthResponse(
            accessToken,
            refreshToken,
            tokenProvider.getAccessTokenExpirationMs(),
            userDTO
        );
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshTokenValue = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
            .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token has expired");
        }

        User user = refreshToken.getUser();
        
        // Generate new access token
        String newAccessToken = tokenProvider.generateAccessToken(user.getEmail());
        
        // Optionally generate new refresh token
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getEmail());
        
        // Delete old refresh token and save new one
        refreshTokenRepository.delete(refreshToken);
        saveRefreshToken(user, newRefreshToken);

        UserDTO userDTO = userMapper.toDTO(user);

        logger.info("Token refreshed for user: {}", user.getEmail());

        return new AuthResponse(
            newAccessToken,
            newRefreshToken,
            tokenProvider.getAccessTokenExpirationMs(),
            userDTO
        );
    }

    public void logout(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
            .orElse(null);
        
        if (refreshToken != null) {
            refreshTokenRepository.delete(refreshToken);
            logger.info("User {} logged out", refreshToken.getUser().getEmail());
        }
    }

    private void saveRefreshToken(User user, String tokenValue) {
        Instant expiryDate = Instant.now().plusMillis(tokenProvider.getRefreshTokenExpirationMs());
        
        RefreshToken refreshToken = new RefreshToken(tokenValue, user, expiryDate);
        refreshTokenRepository.save(refreshToken);
    }

    private void cleanupOldTokensForUser(User user) {
        int maxTokensPerUser = 5; // Allow max 5 active sessions per user
        int currentTokenCount = refreshTokenRepository.countByUser(user);
        
        if (currentTokenCount >= maxTokensPerUser) {
            refreshTokenRepository.deleteOldestTokensForUser(user, maxTokensPerUser - 1);
        }
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String email = authentication.getName();
        return userRepository.findByEmailAndActiveTrue(email).orElse(null);
    }

    // Cleanup expired tokens (should be called periodically)
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(Instant.now());
        logger.info("Expired refresh tokens cleaned up");
    }
}
