package gw.precaju.repository;

import gw.precaju.entity.User;
import gw.precaju.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndActiveTrue(String email);

    boolean existsByEmail(String email);

    Page<User> findByActiveTrue(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.active = true ORDER BY u.createdAt DESC")
    Page<User> findAllActiveUsers(Pageable pageable);

    List<User> findByRole(UserRole role);

    @Query("SELECT u FROM User u WHERE u.active = true AND u.emailVerified = true")
    List<User> findAllActiveAndVerified();

    @Query("SELECT u FROM User u WHERE u.reputationScore >= :minScore ORDER BY u.reputationScore DESC")
    List<User> findByReputationScoreGreaterThanEqualOrderByReputationScoreDesc(@Param("minScore") Integer minScore);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.active = true")
    long countByRoleAndActiveTrue(@Param("role") UserRole role);
}
