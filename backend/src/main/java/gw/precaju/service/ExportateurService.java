package gw.precaju.service;

import gw.precaju.dto.ExportateurDTO;
import gw.precaju.dto.PageResponse;
import gw.precaju.dto.VerificationResultDTO;
import gw.precaju.dto.request.ExportateurCreateRequest;
import gw.precaju.dto.request.ExportateurUpdateRequest;
import gw.precaju.entity.Exportateur;
import gw.precaju.entity.Region;
import gw.precaju.entity.VerificationLog;
import gw.precaju.entity.enums.ExportateurType;
import gw.precaju.entity.enums.StatutType;
import gw.precaju.mapper.ExportateurMapper;
import gw.precaju.repository.ExportateurRepository;
import gw.precaju.repository.RegionRepository;
import gw.precaju.repository.VerificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExportateurService {

    private static final Logger logger = LoggerFactory.getLogger(ExportateurService.class);

    private final ExportateurRepository exportateurRepository;
    private final RegionRepository regionRepository;
    private final VerificationLogRepository verificationLogRepository;
    private final ExportateurMapper exportateurMapper;
    private final QRCodeService qrCodeService;

    public ExportateurService(ExportateurRepository exportateurRepository,
                             RegionRepository regionRepository,
                             VerificationLogRepository verificationLogRepository,
                             ExportateurMapper exportateurMapper,
                             QRCodeService qrCodeService) {
        this.exportateurRepository = exportateurRepository;
        this.regionRepository = regionRepository;
        this.verificationLogRepository = verificationLogRepository;
        this.exportateurMapper = exportateurMapper;
        this.qrCodeService = qrCodeService;
    }

    /**
     * Récupère tous les exportateurs avec pagination et filtres
     */
    @Transactional(readOnly = true)
    public PageResponse<ExportateurDTO> findAll(int page, int size, String sortBy, String sortDir,
                                               String regionCode, String type, String statut, String nom) {
        logger.info("Finding exportateurs with filters - page: {}, size: {}, regionCode: {}, type: {}, statut: {}, nom: {}",
                page, size, regionCode, type, statut, nom);

        // Validation et normalisation des paramètres de tri
        String validSortBy = validateSortField(sortBy);
        Sort.Direction direction = Sort.Direction.fromString(sortDir.toUpperCase());
        Sort sort = Sort.by(direction, validSortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        // Test temporaire avec méthode simple sans aucun filtre
        Page<Exportateur> exportateurPage = exportateurRepository.findAllSimple(pageable);

        List<ExportateurDTO> dtos = exportateurPage.getContent().stream()
                .map(exportateurMapper::toDTO)
                .collect(Collectors.toList());

        return new PageResponse<ExportateurDTO>(
                dtos,
                exportateurPage.getNumber(),
                exportateurPage.getSize(),
                exportateurPage.getTotalElements(),
                exportateurPage.getTotalPages(),
                exportateurPage.isFirst(),
                exportateurPage.isLast()
        );
    }

    /**
     * Récupère un exportateur par son ID
     */
    @Transactional(readOnly = true)
    public Optional<ExportateurDTO> findById(UUID id) {
        logger.info("Finding exportateur by id: {}", id);
        return exportateurRepository.findById(id)
                .map(exportateurMapper::toDTO);
    }

    /**
     * Récupère un exportateur par son token QR code
     */
    @Transactional(readOnly = true)
    public Optional<ExportateurDTO> findByQrCodeToken(String qrCodeToken) {
        logger.info("Finding exportateur by QR code token: {}", qrCodeToken);
        return exportateurRepository.findByQrCodeToken(qrCodeToken)
                .map(exportateurMapper::toDTO);
    }

    /**
     * Vérifie un exportateur via son token QR code
     */
    @Transactional(readOnly = true)
    public VerificationResultDTO verifyByQrCodeToken(String qrCodeToken, String userSession, String ipAddress, String userAgent) {
        logger.info("Verifying exportateur by QR code token: {}", qrCodeToken);

        Optional<Exportateur> exportateurOpt = exportateurRepository.findByQrCodeToken(qrCodeToken);

        if (exportateurOpt.isEmpty()) {
            logger.warn("Exportateur not found for QR code token: {}", qrCodeToken);
            logVerification(qrCodeToken, userSession, "NOT_FOUND", ipAddress, userAgent);
            return VerificationResultDTO.notFound();
        }

        Exportateur exportateur = exportateurOpt.get();

        // Vérifier le statut
        if (exportateur.isExpire()) {
            logger.warn("Exportateur expired: {}", exportateur.getId());
            logVerification(exportateur, userSession, "EXPIRED", ipAddress, userAgent);
            return VerificationResultDTO.expired();
        }

        if (exportateur.isSuspendu()) {
            logger.warn("Exportateur suspended: {}", exportateur.getId());
            logVerification(exportateur, userSession, "SUSPENDED", ipAddress, userAgent);
            return VerificationResultDTO.suspended();
        }

        logger.info("Exportateur verified successfully: {}", exportateur.getId());
        logVerification(exportateur, userSession, "SUCCESS", ipAddress, userAgent);
        return exportateurMapper.toSuccessVerificationResult(exportateur);
    }

    /**
     * Crée un nouvel exportateur (admin seulement)
     */
    @PreAuthorize("hasRole('ADMIN')")
    public ExportateurDTO create(ExportateurCreateRequest request) {
        logger.info("Creating new exportateur: {}", request.getNom());

        // Vérifier que le numéro d'agrément n'existe pas déjà
        if (exportateurRepository.existsByNumeroAgrement(request.getNumeroAgrement())) {
            throw new IllegalArgumentException("Un exportateur avec ce numéro d'agrément existe déjà");
        }

        // Récupérer la région
        Region region = regionRepository.findByCodeAndActiveTrue(request.getRegionCode())
                .orElseThrow(() -> new IllegalArgumentException("Région non trouvée: " + request.getRegionCode()));

        // Générer le token QR code
        String qrCodeToken = qrCodeService.generateQRCodeTokenForExportateur(
                request.getNumeroAgrement(), request.getRegionCode());

        // Vérifier que le token QR est unique
        while (exportateurRepository.existsByQrCodeToken(qrCodeToken)) {
            qrCodeToken = qrCodeService.generateQRCodeTokenForExportateur(
                    request.getNumeroAgrement(), request.getRegionCode());
        }

        // Créer l'exportateur
        Exportateur exportateur = new Exportateur();
        exportateur.setNom(request.getNom());
        exportateur.setNumeroAgrement(request.getNumeroAgrement());
        exportateur.setType(request.getType());
        exportateur.setRegion(region);
        exportateur.setTelephone(request.getTelephone());
        exportateur.setEmail(request.getEmail());
        exportateur.setQrCodeToken(qrCodeToken);
        exportateur.setDateCertification(request.getDateCertification());
        exportateur.setDateExpiration(request.getDateExpiration());
        exportateur.setStatut(request.getStatut());

        Exportateur saved = exportateurRepository.save(exportateur);
        logger.info("Exportateur created successfully with id: {}", saved.getId());

        return exportateurMapper.toDTO(saved);
    }

    /**
     * Met à jour un exportateur (admin seulement)
     */
    @PreAuthorize("hasRole('ADMIN')")
    public Optional<ExportateurDTO> update(UUID id, ExportateurUpdateRequest request) {
        logger.info("Updating exportateur: {}", id);

        return exportateurRepository.findById(id)
                .map(existing -> {
                    if (request.getNom() != null) {
                        existing.setNom(request.getNom());
                    }
                    if (request.getTelephone() != null) {
                        existing.setTelephone(request.getTelephone());
                    }
                    if (request.getEmail() != null) {
                        existing.setEmail(request.getEmail());
                    }
                    if (request.getDateCertification() != null) {
                        existing.setDateCertification(request.getDateCertification());
                    }
                    if (request.getDateExpiration() != null) {
                        existing.setDateExpiration(request.getDateExpiration());
                    }
                    if (request.getStatut() != null) {
                        existing.setStatut(request.getStatut());
                    }

                    Exportateur saved = exportateurRepository.save(existing);
                    logger.info("Exportateur updated successfully: {}", saved.getId());
                    return exportateurMapper.toDTO(saved);
                });
    }

    /**
     * Supprime un exportateur (admin seulement)
     */
    @PreAuthorize("hasRole('ADMIN')")
    public boolean delete(UUID id) {
        logger.info("Deleting exportateur: {}", id);

        if (exportateurRepository.existsById(id)) {
            exportateurRepository.deleteById(id);
            logger.info("Exportateur deleted successfully: {}", id);
            return true;
        }

        logger.warn("Exportateur not found for deletion: {}", id);
        return false;
    }

    /**
     * Récupère les statistiques des exportateurs
     */
    @Transactional(readOnly = true)
    public List<Object[]> getStatistics() {
        logger.info("Getting exportateur statistics");
        return exportateurRepository.countByRegionAndStatut();
    }

    /**
     * Récupère les exportateurs expirant bientôt
     */
    @Transactional(readOnly = true)
    public List<ExportateurDTO> findExpiringSoon(int days) {
        logger.info("Finding exportateurs expiring in {} days", days);
        LocalDate today = LocalDate.now();
        LocalDate expirationDate = today.plusDays(days);

        return exportateurRepository.findExpiringSoon(today, expirationDate)
                .stream()
                .map(exportateurMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Log une vérification
     */
    private void logVerification(Exportateur exportateur, String userSession, String result, String ipAddress, String userAgent) {
        VerificationLog log = new VerificationLog(exportateur, userSession, result, ipAddress, userAgent);
        verificationLogRepository.save(log);
    }

    /**
     * Log une vérification pour un token non trouvé
     */
    private void logVerification(String qrCodeToken, String userSession, String result, String ipAddress, String userAgent) {
        VerificationLog log = new VerificationLog();
        log.setUserSession(userSession);
        log.setResult(result);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setVerificationTime(java.time.Instant.now());
        verificationLogRepository.save(log);
    }

    /**
     * Valide et normalise le champ de tri
     */
    private String validateSortField(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return "nom";
        }
        
        String normalizedSortBy = sortBy.trim().toLowerCase();
        
        // Champs valides pour le tri
        switch (normalizedSortBy) {
            case "nom":
            case "name":
                return "nom";
            case "numeroagrement":
            case "numero_agrement":
            case "numeroAgrement":
                return "numeroAgrement";
            case "type":
                return "type";
            case "statut":
            case "status":
                return "statut";
            case "datecertification":
            case "date_certification":
            case "dateCertification":
                return "dateCertification";
            case "dateexpiration":
            case "date_expiration":
            case "dateExpiration":
                return "dateExpiration";
            case "createdat":
            case "created_at":
            case "createdAt":
                return "createdAt";
            case "updatedat":
            case "updated_at":
            case "updatedAt":
                return "updatedAt";
            default:
                logger.warn("Invalid sort field '{}', using default 'nom'", sortBy);
                return "nom";
        }
    }
}
