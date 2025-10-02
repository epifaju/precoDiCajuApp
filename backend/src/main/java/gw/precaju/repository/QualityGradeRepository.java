package gw.precaju.repository;

import gw.precaju.entity.QualityGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QualityGradeRepository extends JpaRepository<QualityGrade, String> {

    List<QualityGrade> findByActiveTrue();

    Optional<QualityGrade> findByCodeAndActiveTrue(String code);

    @Query("SELECT q FROM QualityGrade q WHERE q.active = true ORDER BY q.namePt")
    List<QualityGrade> findAllActiveOrderByName();

    boolean existsByCode(String code);
}


















