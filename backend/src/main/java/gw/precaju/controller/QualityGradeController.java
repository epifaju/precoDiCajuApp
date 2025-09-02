package gw.precaju.controller;

import gw.precaju.entity.QualityGrade;
import gw.precaju.repository.QualityGradeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/qualities")
@CrossOrigin(origins = "*")
public class QualityGradeController {

    private static final Logger logger = LoggerFactory.getLogger(QualityGradeController.class);

    private final QualityGradeRepository qualityGradeRepository;

    public QualityGradeController(QualityGradeRepository qualityGradeRepository) {
        this.qualityGradeRepository = qualityGradeRepository;
    }

    @GetMapping
    public ResponseEntity<List<QualityGrade>> getAllQualityGrades() {
        try {
            List<QualityGrade> qualities = qualityGradeRepository.findAllActiveOrderByName();
            return ResponseEntity.ok(qualities);
        } catch (Exception e) {
            logger.error("Error retrieving quality grades", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{code}")
    public ResponseEntity<QualityGrade> getQualityGradeByCode(@PathVariable String code) {
        try {
            Optional<QualityGrade> quality = qualityGradeRepository.findByCodeAndActiveTrue(code);
            return quality.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error retrieving quality grade with code: {}", code, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}





