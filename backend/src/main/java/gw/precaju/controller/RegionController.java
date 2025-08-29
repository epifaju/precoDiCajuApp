package gw.precaju.controller;

import gw.precaju.entity.Region;
import gw.precaju.repository.RegionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/regions")
public class RegionController {

    private static final Logger logger = LoggerFactory.getLogger(RegionController.class);

    private final RegionRepository regionRepository;

    public RegionController(RegionRepository regionRepository) {
        this.regionRepository = regionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Region>> getAllRegions() {
        try {
            List<Region> regions = regionRepository.findAllActiveOrderByName();
            return ResponseEntity.ok(regions);
        } catch (Exception e) {
            logger.error("Error retrieving regions", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{code}")
    public ResponseEntity<Region> getRegionByCode(@PathVariable String code) {
        try {
            Optional<Region> region = regionRepository.findByCodeAndActiveTrue(code);
            return region.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error retrieving region with code: {}", code, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
