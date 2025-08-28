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
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/prices")
@CrossOrigin(origins = "*")
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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader(name = "Accept-Language", defaultValue = "pt") String language) {

        try {
            // Validate and limit page size
            if (size > 100) size = 100;
            if (page < 0) page = 0;

            // Create sort
            Sort sort = sortDir.equalsIgnoreCase("asc") ? 
                Sort.by(sortBy).ascending() : 
                Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);

            Page<PriceDTO> prices = priceService.getAllPrices(
                region, quality, from, to, pageable, language);

            return ResponseEntity.ok(PageResponse.of(prices));

        } catch (Exception e) {
            logger.error("Error retrieving prices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
    @PreAuthorize("hasRole('USER')")
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
    @PreAuthorize("hasRole('USER')")
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
    @PreAuthorize("hasRole('USER')")
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

        try {
            // Validate days parameter
            if (days < 1) days = 1;
            if (days > 365) days = 365;

            PriceStatsDTO stats = priceService.getPriceStatistics(region, quality, days, language);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            logger.error("Error retrieving price statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
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

            if (size > 100) size = 100;
            if (page < 0) page = 0;

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
            if (size > 100) size = 100;
            if (page < 0) page = 0;

            Pageable pageable = PageRequest.of(page, size);
            Page<PriceDTO> prices = priceService.getUnverifiedPrices(pageable, language);
            return ResponseEntity.ok(PageResponse.of(prices));

        } catch (Exception e) {
            logger.error("Error retrieving unverified prices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
