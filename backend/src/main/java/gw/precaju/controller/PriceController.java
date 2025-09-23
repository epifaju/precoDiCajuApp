package gw.precaju.controller;

import gw.precaju.dto.PageResponse;
import gw.precaju.dto.PriceDTO;
import gw.precaju.dto.PriceStatsDTO;
import gw.precaju.dto.request.CreatePriceRequest;
import gw.precaju.entity.User;
import gw.precaju.service.AuthService;
import gw.precaju.service.PriceService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/prices")
public class PriceController {

    private static final Logger logger = LoggerFactory.getLogger(PriceController.class);

    private final PriceService priceService;
    private final AuthService authService;

    public PriceController(PriceService priceService, AuthService authService) {
        this.priceService = priceService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<PriceDTO>> getPrices(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String quality,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader(name = "Accept-Language", defaultValue = "pt") String language) {

        try {
            logger.debug(
                    "Received request for prices - region: {}, quality: {}, from: {}, to: {}, verified: {}, page: {}, size: {}, sortBy: {}, sortDir: {}",
                    region, quality, from, to, verified, page, size, sortBy, sortDir);

            // Validate and limit page size
            if (size > 100)
                size = 100;
            if (page < 0)
                page = 0;

            // Validate sortBy parameter
            if (!isValidSortBy(sortBy)) {
                logger.warn("Invalid sortBy parameter: {}", sortBy);
                return ResponseEntity.badRequest().build();
            }

            // Validate sortDir parameter
            if (!isValidSortDir(sortDir)) {
                logger.warn("Invalid sortDir parameter: {}", sortDir);
                return ResponseEntity.badRequest().build();
            }

            // Create sort
            Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);

            Page<PriceDTO> prices = priceService.getAllPrices(
                    region, quality, from, to, verified, pageable, language);

            logger.info("Successfully retrieved {} prices (page {} of {})",
                    prices.getTotalElements(), page + 1, prices.getTotalPages());

            return ResponseEntity.ok(PageResponse.of(prices));

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument in prices request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error retrieving prices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean isValidSortBy(String sortBy) {
        return sortBy != null
                && (sortBy.equals("recordedDate") || sortBy.equals("priceFcfa") || sortBy.equals("createdAt"));
    }

    private boolean isValidSortDir(String sortDir) {
        return sortDir != null && (sortDir.equalsIgnoreCase("asc") || sortDir.equalsIgnoreCase("desc"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PriceDTO> getPriceById(
            @PathVariable UUID id,
            @RequestHeader(name = "Accept-Language", defaultValue = "pt") String language) {

        try {
            Optional<PriceDTO> price = priceService.getPriceById(id, language);
            return price.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());

        } catch (Exception e) {
            logger.error("Error retrieving price with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'CONTRIBUTOR')")
    public ResponseEntity<PriceDTO> createPrice(
            @Valid @ModelAttribute CreatePriceRequest request,
            @RequestHeader(name = "Accept-Language", defaultValue = "pt") String language) {

        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Set recorded date to today if not provided
            if (request.getRecordedDate() == null) {
                request.setRecordedDate(LocalDate.now());
            }

            PriceDTO createdPrice = priceService.createPrice(request, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPrice);

        } catch (RuntimeException e) {
            logger.error("Error creating price", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error creating price", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'CONTRIBUTOR')")
    public ResponseEntity<PriceDTO> updatePrice(
            @PathVariable UUID id,
            @Valid @ModelAttribute CreatePriceRequest request) {

        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            PriceDTO updatedPrice = priceService.updatePrice(id, request, currentUser);
            return ResponseEntity.ok(updatedPrice);

        } catch (RuntimeException e) {
            logger.error("Error updating price with ID: {}", id, e);
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error updating price with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'CONTRIBUTOR')")
    public ResponseEntity<Void> deletePrice(@PathVariable UUID id) {

        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            priceService.deletePrice(id, currentUser);
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            logger.error("Error deleting price with ID: {}", id, e);
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error deleting price with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<PriceDTO> verifyPrice(@PathVariable UUID id) {

        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            PriceDTO verifiedPrice = priceService.verifyPrice(id, currentUser);
            return ResponseEntity.ok(verifiedPrice);

        } catch (RuntimeException e) {
            logger.error("Error verifying price with ID: {}", id, e);
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error verifying price with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<PriceStatsDTO> getPriceStatistics(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String quality,
            @RequestParam(defaultValue = "30") int days,
            @RequestHeader(name = "Accept-Language", defaultValue = "pt") String language) {

        logger.info("Received request for price statistics - region: {}, quality: {}, days: {}, language: {}",
                region, quality, days, language);

        try {
            // Validate days parameter
            if (days < 1) {
                logger.warn("Invalid days parameter: {}, setting to 1", days);
                days = 1;
            }
            if (days > 365) {
                logger.warn("Days parameter too large: {}, limiting to 365", days);
                days = 365;
            }

            logger.debug("Calling priceService.getPriceStatistics with validated parameters");
            PriceStatsDTO stats = priceService.getPriceStatistics(region, quality, days, language);

            logger.info("Successfully retrieved price statistics - total prices: {}", stats.getTotalPrices());
            return ResponseEntity.ok(stats);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument in price statistics request - region: {}, quality: {}, days: {}",
                    region, quality, days, e);
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            logger.error("Runtime error in price statistics request - region: {}, quality: {}, days: {}",
                    region, quality, days, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            logger.error("Unexpected error in price statistics request - region: {}, quality: {}, days: {}",
                    region, quality, days, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'CONTRIBUTOR')")
    public ResponseEntity<PageResponse<PriceDTO>> getUserPrices(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(name = "Accept-Language", defaultValue = "pt") String language) {

        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Users can only see their own prices unless they are admin/moderator
            if (!currentUser.isModerator() && !currentUser.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            if (size > 100)
                size = 100;
            if (page < 0)
                page = 0;

            Pageable pageable = PageRequest.of(page, size,
                    Sort.by("createdAt").descending());

            Page<PriceDTO> prices = priceService.getUserPrices(userId, pageable, language);
            return ResponseEntity.ok(PageResponse.of(prices));

        } catch (Exception e) {
            logger.error("Error retrieving user prices for user ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/unverified")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<PageResponse<PriceDTO>> getUnverifiedPrices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(name = "Accept-Language", defaultValue = "pt") String language) {

        try {
            if (size > 100)
                size = 100;
            if (page < 0)
                page = 0;

            Pageable pageable = PageRequest.of(page, size);
            Page<PriceDTO> prices = priceService.getUnverifiedPrices(pageable, language);
            return ResponseEntity.ok(PageResponse.of(prices));

        } catch (Exception e) {
            logger.error("Error retrieving unverified prices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<PriceDTO>> getPriceHistory(
            @RequestParam String regionCode,
            @RequestParam String qualityGrade,
            @RequestParam(defaultValue = "30") int days,
            @RequestHeader(name = "Accept-Language", defaultValue = "pt") String language) {

        logger.info("Received request for price history - region: {}, quality: {}, days: {}, language: {}",
                regionCode, qualityGrade, days, language);

        try {
            // Validate days parameter
            if (days < 1) {
                logger.warn("Invalid days parameter: {}, setting to 1", days);
                days = 1;
            }
            if (days > 365) {
                logger.warn("Days parameter too large: {}, limiting to 365", days);
                days = 365;
            }

            List<PriceDTO> history = priceService.getPriceHistory(regionCode, qualityGrade, days, language);
            logger.info("Successfully retrieved {} price history entries", history.size());
            return ResponseEntity.ok(history);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument in price history request - region: {}, quality: {}, days: {}",
                    regionCode, qualityGrade, days, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error in price history request - region: {}, quality: {}, days: {}",
                    regionCode, qualityGrade, days, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
