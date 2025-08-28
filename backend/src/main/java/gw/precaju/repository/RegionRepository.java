package gw.precaju.repository;

import gw.precaju.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegionRepository extends JpaRepository<Region, String> {

    List<Region> findByActiveTrue();

    Optional<Region> findByCodeAndActiveTrue(String code);

    @Query("SELECT r FROM Region r WHERE r.active = true ORDER BY r.namePt")
    List<Region> findAllActiveOrderByName();

    boolean existsByCode(String code);
}
