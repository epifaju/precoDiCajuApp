package gw.precaju.security;

import gw.precaju.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private int accessTokenExpirationMs;

    @Value("${jwt.refresh-token-expiration}")
    private int refreshTokenExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateAccessToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateAccessToken(userPrincipal.getUsername());
    }

    public String generateAccessToken(User user) {
        return generateAccessToken(user.getEmail());
    }

    public String generateAccessToken(String username) {
        Date expiryDate = new Date(System.currentTimeMillis() + accessTokenExpirationMs);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String username) {
        Date expiryDate = new Date(System.currentTimeMillis() + refreshTokenExpirationMs);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (SecurityException ex) {
            logger.warn("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            logger.warn("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.warn("Expired JWT token - expired at: {}", ex.getClaims().getExpiration());
        } catch (UnsupportedJwtException ex) {
            logger.warn("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.warn("JWT claims string is empty: {}", ex.getMessage());
        } catch (Exception ex) {
            logger.warn("Unexpected error validating JWT token: {}", ex.getMessage());
        }
        return false;
    }

    public Date getExpirationDateFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getExpiration();
    }

    public boolean isTokenExpired(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public long getAccessTokenExpirationMs() {
        return accessTokenExpirationMs;
    }

    public long getRefreshTokenExpirationMs() {
        return refreshTokenExpirationMs;
    }

    /**
     * Vérifie si un token va expirer dans les prochaines minutes
     */
    public boolean isTokenExpiringSoon(String token, int minutesBeforeExpiration) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            Date now = new Date();
            long timeUntilExpiration = expiration.getTime() - now.getTime();
            long thresholdMs = minutesBeforeExpiration * 60 * 1000;

            return timeUntilExpiration <= thresholdMs && timeUntilExpiration > 0;
        } catch (Exception ex) {
            logger.warn("Error checking if token is expiring soon: {}", ex.getMessage());
            return false;
        }
    }

    /**
     * Récupère le temps restant avant expiration en minutes
     */
    public long getTimeUntilExpirationMinutes(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            Date now = new Date();
            long timeUntilExpiration = expiration.getTime() - now.getTime();

            if (timeUntilExpiration <= 0) {
                return 0;
            }

            return timeUntilExpiration / (60 * 1000);
        } catch (Exception ex) {
            logger.warn("Error getting time until expiration: {}", ex.getMessage());
            return 0;
        }
    }
}
