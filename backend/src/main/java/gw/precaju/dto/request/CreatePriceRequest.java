package gw.precaju.dto.request;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreatePriceRequest {

    @NotBlank(message = "Region code is required")
    @Size(max = 10, message = "Region code must not exceed 10 characters")
    private String regionCode;

    @NotBlank(message = "Quality grade is required")
    @Size(max = 20, message = "Quality grade must not exceed 20 characters")
    private String qualityGrade;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "99999.99", message = "Price must be less than 100,000 FCFA")
    private BigDecimal priceFcfa;

    @NotNull(message = "Recorded date is required")
    private LocalDate recordedDate;

    @Size(max = 100, message = "Source name must not exceed 100 characters")
    private String sourceName;

    @Pattern(regexp = "^(market|cooperative|producer|trader|other)$", 
             message = "Source type must be one of: market, cooperative, producer, trader, other")
    private String sourceType;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private BigDecimal gpsLat;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private BigDecimal gpsLng;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    private MultipartFile photoFile;

    // Constructors
    public CreatePriceRequest() {}

    // Getters and Setters
    public String getRegionCode() {
        return regionCode;
    }

    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    public String getQualityGrade() {
        return qualityGrade;
    }

    public void setQualityGrade(String qualityGrade) {
        this.qualityGrade = qualityGrade;
    }

    public BigDecimal getPriceFcfa() {
        return priceFcfa;
    }

    public void setPriceFcfa(BigDecimal priceFcfa) {
        this.priceFcfa = priceFcfa;
    }

    public LocalDate getRecordedDate() {
        return recordedDate;
    }

    public void setRecordedDate(LocalDate recordedDate) {
        this.recordedDate = recordedDate;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public BigDecimal getGpsLat() {
        return gpsLat;
    }

    public void setGpsLat(BigDecimal gpsLat) {
        this.gpsLat = gpsLat;
    }

    public BigDecimal getGpsLng() {
        return gpsLng;
    }

    public void setGpsLng(BigDecimal gpsLng) {
        this.gpsLng = gpsLng;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public MultipartFile getPhotoFile() {
        return photoFile;
    }

    public void setPhotoFile(MultipartFile photoFile) {
        this.photoFile = photoFile;
    }
}







