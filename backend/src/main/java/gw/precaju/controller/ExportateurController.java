package gw.precaju.controller;

import gw.precaju.dto.ExportateurDTO;
import gw.precaju.dto.PageResponse;
import gw.precaju.dto.VerificationResultDTO;
import gw.precaju.dto.request.ExportateurCreateRequest;
import gw.precaju.dto.request.ExportateurUpdateRequest;
import gw.precaju.service.ExportateurService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exportateurs")
public class ExportateurController {

    private static final Logger logger = LoggerFactory.getLogger(ExportateurController.class);

    private final ExportateurService exportateurService;

    public ExportateurController(ExportateurService exportateurService) {
        this.exportateurService = exportateurService;
    }

    /**
     * Récupère tous les exportateurs avec pagination et filtres
     */
    @GetMapping
    public ResponseEntity<PageResponse<ExportateurDTO>> getAllExportateurs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nom") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String regionCode,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String nom) {

        try {
            logger.debug(
                    "Getting exportateurs with filters - page: {}, size: {}, regionCode: '{}', type: '{}', statut: '{}', nom: '{}'",
                    page, size, regionCode, type, statut, nom);

            PageResponse<ExportateurDTO> response = exportateurService.findAllWithWorkingFilters(
                    page, size, sortBy, sortDir, regionCode, type, statut, nom);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving exportateurs", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupère un exportateur par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExportateurDTO> getExportateurById(@PathVariable UUID id) {
        try {
            logger.info("Getting exportateur by id: {}", id);

            Optional<ExportateurDTO> exportateur = exportateurService.findById(id);
            return exportateur.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error retrieving exportateur with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Vérifie un exportateur via son token QR code
     */
    @GetMapping("/verify/{qrToken}")
    public ResponseEntity<VerificationResultDTO> verifyByQrToken(
            @PathVariable String qrToken,
            HttpServletRequest request) {

        try {
            logger.info("Verifying exportateur by QR token: {}", qrToken);

            String userSession = request.getSession().getId();
            String ipAddress = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");

            VerificationResultDTO result = exportateurService.verifyByQrCodeToken(
                    qrToken, userSession, ipAddress, userAgent);

            if (result.isSuccess()) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            }
        } catch (Exception e) {
            logger.error("Error verifying exportateur with QR token: {}", qrToken, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Crée un nouvel exportateur (admin seulement)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createExportateur(@Valid @RequestBody ExportateurCreateRequest request) {
        try {
            logger.info("Creating new exportateur: {}", request.getNom());

            ExportateurDTO created = exportateurService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request for creating exportateur: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating exportateur", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Met à jour un exportateur (admin seulement)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateExportateur(
            @PathVariable UUID id,
            @Valid @RequestBody ExportateurUpdateRequest request) {

        try {
            logger.info("Updating exportateur: {}", id);

            Optional<ExportateurDTO> updated = exportateurService.update(id, request);
            return updated.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error updating exportateur with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Supprime un exportateur (admin seulement)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExportateur(@PathVariable UUID id) {
        try {
            logger.info("Deleting exportateur: {}", id);

            boolean deleted = exportateurService.delete(id);
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting exportateur with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupère les statistiques des exportateurs
     */
    @GetMapping("/statistics")
    public ResponseEntity<List<Object[]>> getStatistics() {
        try {
            logger.info("Getting exportateur statistics");

            List<Object[]> statistics = exportateurService.getStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error getting exportateur statistics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupère les exportateurs expirant bientôt
     */
    @GetMapping("/expiring-soon")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExportateurDTO>> getExpiringSoon(
            @RequestParam(defaultValue = "30") int days) {

        try {
            logger.info("Getting exportateurs expiring in {} days", days);

            List<ExportateurDTO> expiring = exportateurService.findExpiringSoon(days);
            return ResponseEntity.ok(expiring);
        } catch (Exception e) {
            logger.error("Error getting expiring exportateurs", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupère l'adresse IP du client
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
