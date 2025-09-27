package gw.precaju.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

@Service
public class QRCodeService {

    private static final Logger logger = LoggerFactory.getLogger(QRCodeService.class);
    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * Génère un token QR code unique pour un exportateur
     */
    public String generateQRCodeToken() {
        // Génère un token unique basé sur UUID + timestamp + random
        String uuid = UUID.randomUUID().toString().replace("-", "");
        long timestamp = System.currentTimeMillis();
        byte[] randomBytes = new byte[16];
        secureRandom.nextBytes(randomBytes);
        String randomString = Base64.getEncoder().encodeToString(randomBytes).replace("=", "");
        
        String token = String.format("qr_%s_%d_%s", 
            uuid.substring(0, 8), 
            timestamp, 
            randomString.substring(0, 8)
        );
        
        logger.debug("Generated QR code token: {}", token);
        return token;
    }

    /**
     * Valide le format d'un token QR code
     */
    public boolean isValidQRCodeFormat(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        
        // Format attendu: qr_[uuid]_[timestamp]_[random]
        return token.matches("^qr_[a-f0-9]{8}_\\d+_[a-zA-Z0-9]{8}$");
    }

    /**
     * Génère un token QR code pour un exportateur spécifique
     */
    public String generateQRCodeTokenForExportateur(String numeroAgrement, String regionCode) {
        // Génère un token plus lisible incluant des infos de l'exportateur
        String cleanNumero = numeroAgrement.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String cleanRegion = regionCode.toLowerCase();
        
        String token = String.format("qr_%s_%s_%d", 
            cleanRegion, 
            cleanNumero.substring(Math.max(0, cleanNumero.length() - 6)),
            System.currentTimeMillis() / 1000 // timestamp en secondes pour plus de lisibilité
        );
        
        logger.debug("Generated QR code token for exportateur {}: {}", numeroAgrement, token);
        return token;
    }

    /**
     * Extrait les informations d'un token QR code
     */
    public QRCodeInfo parseQRCodeToken(String token) {
        if (!isValidQRCodeFormat(token)) {
            return null;
        }
        
        try {
            String[] parts = token.split("_");
            if (parts.length >= 4) {
                return new QRCodeInfo(
                    parts[1], // uuid
                    Long.parseLong(parts[2]), // timestamp
                    parts[3]  // random
                );
            }
        } catch (Exception e) {
            logger.warn("Error parsing QR code token: {}", token, e);
        }
        
        return null;
    }

    /**
     * Classe pour représenter les informations extraites d'un token QR
     */
    public static class QRCodeInfo {
        private final String uuid;
        private final long timestamp;
        private final String random;

        public QRCodeInfo(String uuid, long timestamp, String random) {
            this.uuid = uuid;
            this.timestamp = timestamp;
            this.random = random;
        }

        public String getUuid() {
            return uuid;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public String getRandom() {
            return random;
        }

        public boolean isRecent(long maxAgeInSeconds) {
            long currentTime = System.currentTimeMillis() / 1000;
            return (currentTime - timestamp) <= maxAgeInSeconds;
        }

        @Override
        public String toString() {
            return "QRCodeInfo{" +
                    "uuid='" + uuid + '\'' +
                    ", timestamp=" + timestamp +
                    ", random='" + random + '\'' +
                    '}';
        }
    }
}
