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
    public VerificationResultDTO verifyByQrCodeToken(String qrCodeToken, String userSession, String ipAddress,
            String userAgent) {
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
    private void logVerification(Exportateur exportateur, String userSession, String result, String ipAddress,
            String userAgent) {
        VerificationLog log = new VerificationLog(exportateur, userSession, result, ipAddress, userAgent);
        verificationLogRepository.save(log);
    }

    /**
     * Log une vérification pour un token non trouvé
     */
    private void logVerification(String qrCodeToken, String userSession, String result, String ipAddress,
            String userAgent) {
        VerificationLog log = new VerificationLog();
        log.setUserSession(userSession);
        log.setResult(result);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setVerificationTime(java.time.Instant.now());
        verificationLogRepository.save(log);
    }

    /**
     * MÉTHODE CORRIGÉE : Récupère les exportateurs avec filtrage manuel fonctionnel
     */
    @Transactional(readOnly = true)
    public PageResponse<ExportateurDTO> findAllWithWorkingFilters(int page, int size, String sortBy, String sortDir,
            String regionCode, String type, String statut, String nom) {
        logger.info(
                "Finding exportateurs with filters - page: {}, size: {}, regionCode: '{}', type: '{}', statut: '{}', nom: '{}'",
                page, size, regionCode, type, statut, nom);

        // 1. Récupérer TOUS les exportateurs de la base
        List<Exportateur> allExportateurs = exportateurRepository.findAll();
        logger.info("Total exportateurs in database: {}", allExportateurs.size());

        // 2. Normaliser et valider les paramètres de filtre
        String normalizedRegionCode = (regionCode != null && !regionCode.trim().isEmpty()) ? regionCode.trim() : null;
        String normalizedType = (type != null && !type.trim().isEmpty()) ? type.trim().toUpperCase() : null;
        String normalizedStatut = (statut != null && !statut.trim().isEmpty()) ? statut.trim().toUpperCase() : null;
        String normalizedNom = (nom != null && !nom.trim().isEmpty()) ? nom.trim() : null;

        logger.info("Normalized filters - regionCode: '{}', type: '{}', statut: '{}', nom: '{}'",
                normalizedRegionCode, normalizedType, normalizedStatut, normalizedNom);

        // 3. Appliquer les filtres avec Stream API pour plus de clarté
        List<Exportateur> filteredResults = allExportateurs.stream()
                .filter(e -> {
                    // Filtre par région
                    if (normalizedRegionCode != null) {
                        if (e.getRegion() == null || !e.getRegion().getCode().equals(normalizedRegionCode)) {
                            return false;
                        }
                    }
                    return true;
                })
                .filter(e -> {
                    // Filtre par type
                    if (normalizedType != null) {
                        try {
                            ExportateurType typeEnum = ExportateurType.valueOf(normalizedType);
                            if (!e.getType().equals(typeEnum)) {
                                return false;
                            }
                        } catch (IllegalArgumentException ex) {
                            logger.warn("Invalid type parameter: '{}', ignoring filter", normalizedType);
                            // Type invalide, ignorer le filtre (inclure l'élément)
                        }
                    }
                    return true;
                })
                .filter(e -> {
                    // Filtre par statut
                    if (normalizedStatut != null) {
                        try {
                            StatutType statutEnum = StatutType.valueOf(normalizedStatut);
                            if (!e.getStatut().equals(statutEnum)) {
                                return false;
                            }
                        } catch (IllegalArgumentException ex) {
                            logger.warn("Invalid statut parameter: '{}', ignoring filter", normalizedStatut);
                            // Statut invalide, ignorer le filtre (inclure l'élément)
                        }
                    }
                    return true;
                })
                .filter(e -> {
                    // Filtre par nom (recherche partielle insensible à la casse)
                    if (normalizedNom != null) {
                        String searchTerm = normalizedNom.toLowerCase();
                        if (!e.getNom().toLowerCase().contains(searchTerm)) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted((e1, e2) -> {
                    // Tri par nom (par défaut)
                    String field1 = e1.getNom();
                    String field2 = e2.getNom();

                    if ("desc".equalsIgnoreCase(sortDir)) {
                        return field2.compareToIgnoreCase(field1);
                    } else {
                        return field1.compareToIgnoreCase(field2);
                    }
                })
                .collect(Collectors.toList());

        logger.info("Filtered results: {} exportateurs (from {} total)", filteredResults.size(),
                allExportateurs.size());

        // 4. Pagination manuelle
        int start = page * size;
        int end = Math.min(start + size, filteredResults.size());

        List<Exportateur> pageContent;
        if (start >= filteredResults.size()) {
            pageContent = new java.util.ArrayList<>();
        } else {
            pageContent = filteredResults.subList(start, end);
        }

        logger.info("Page content: {} items (from {} to {})", pageContent.size(), start, end);

        // 5. Convertir en DTO
        List<ExportateurDTO> dtos = pageContent.stream()
                .map(exportateurMapper::toDTO)
                .collect(Collectors.toList());

        // 6. Créer la réponse paginée
        int totalPages = (int) Math.ceil((double) filteredResults.size() / size);
        boolean isFirst = page == 0;
        boolean isLast = end >= filteredResults.size();

        logger.info("Returning {} DTOs out of {} total filtered results, totalPages: {}",
                dtos.size(), filteredResults.size(), totalPages);

        return new PageResponse<ExportateurDTO>(
                dtos,
                page,
                size,
                filteredResults.size(),
                totalPages,
                isFirst,
                isLast);
    }
}
