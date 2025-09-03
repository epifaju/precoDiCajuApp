package gw.precaju.service;

import gw.precaju.dto.PriceDTO;
import gw.precaju.dto.request.CreatePriceRequest;
import gw.precaju.entity.QualityGrade;
import gw.precaju.entity.Region;
import gw.precaju.entity.User;
import gw.precaju.entity.enums.UserRole;
import gw.precaju.repository.PriceRepository;
import gw.precaju.repository.QualityGradeRepository;
import gw.precaju.repository.RegionRepository;
import gw.precaju.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class PriceServiceTest {

    @Autowired
    private PriceService priceService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private QualityGradeRepository qualityGradeRepository;

    @Autowired
    private PriceRepository priceRepository;

    private User testUser;
    private Region testRegion;
    private QualityGrade testQuality;

    @BeforeEach
    void setUp() {
        // Clean up
        priceRepository.deleteAll();
        userRepository.deleteAll();
        regionRepository.deleteAll();
        qualityGradeRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashed");
        testUser.setFullName("Test User");
        testUser.setRole(UserRole.CONTRIBUTOR);
        testUser.setActive(true);
        testUser.setEmailVerified(true);
        testUser = userRepository.save(testUser);

        // Create test region
        testRegion = new Region();
        testRegion.setCode("TEST");
        testRegion.setNamePt("Test Region");
        testRegion.setActive(true);
        testRegion = regionRepository.save(testRegion);

        // Create test quality
        testQuality = new QualityGrade();
        testQuality.setCode("TEST");
        testQuality.setNamePt("Test Quality");
        testQuality.setActive(true);
        testQuality = qualityGradeRepository.save(testQuality);
    }

    @Test
    void testCreatePrice() {
        CreatePriceRequest request = new CreatePriceRequest();
        request.setRegionCode("TEST");
        request.setQualityGrade("TEST");
        request.setPriceFcfa(BigDecimal.valueOf(2500.00));
        request.setRecordedDate(LocalDate.now());
        request.setSourceName("Test Market");
        request.setSourceType("market");

        PriceDTO result = priceService.createPrice(request, testUser);

        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("TEST", result.getRegion());
        assertEquals("TEST", result.getQuality());
        assertEquals(BigDecimal.valueOf(2500.00), result.getPriceFcfa());
        assertEquals("Test Market", result.getSourceName());
        assertFalse(result.getVerified()); // New prices should be unverified
    }

    @Test
    void testCreatePriceInvalidRegion() {
        CreatePriceRequest request = new CreatePriceRequest();
        request.setRegionCode("INVALID");
        request.setQualityGrade("TEST");
        request.setPriceFcfa(BigDecimal.valueOf(2500.00));
        request.setRecordedDate(LocalDate.now());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            priceService.createPrice(request, testUser);
        });

        assertTrue(exception.getMessage().contains("Invalid region code"));
    }

    @Test
    void testCreatePriceInvalidQuality() {
        CreatePriceRequest request = new CreatePriceRequest();
        request.setRegionCode("TEST");
        request.setQualityGrade("INVALID");
        request.setPriceFcfa(BigDecimal.valueOf(2500.00));
        request.setRecordedDate(LocalDate.now());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            priceService.createPrice(request, testUser);
        });

        assertTrue(exception.getMessage().contains("Invalid quality grade"));
    }
}






