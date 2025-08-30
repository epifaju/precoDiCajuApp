package gw.precaju.mapper;

import gw.precaju.dto.PriceDTO;
import gw.precaju.entity.Price;
import org.springframework.stereotype.Component;

@Component
public class PriceMapper {

    private final UserMapper userMapper;

    public PriceMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public PriceDTO toDTO(Price price) {
        if (price == null) {
            return null;
        }

        PriceDTO dto = new PriceDTO();
        dto.setId(price.getId());
        dto.setPriceFcfa(price.getPriceFcfa());
        dto.setUnit(price.getUnit());
        dto.setRecordedDate(price.getRecordedDate());
        dto.setSourceName(price.getSourceName());
        dto.setSourceType(price.getSourceType());
        dto.setGpsLat(price.getGpsLat());
        dto.setGpsLng(price.getGpsLng());
        dto.setPhotoUrl(price.getPhotoUrl());
        dto.setNotes(price.getNotes());
        dto.setVerified(price.getVerified());
        dto.setVerifiedAt(price.getVerifiedAt());
        dto.setCreatedAt(price.getCreatedAt());

        // Set region info
        if (price.getRegion() != null) {
            dto.setRegion(price.getRegion().getCode());
            dto.setRegionName(price.getRegion().getNamePt()); // Default to Portuguese
        }

        // Set quality info
        if (price.getQualityGrade() != null) {
            dto.setQuality(price.getQualityGrade().getCode());
            dto.setQualityName(price.getQualityGrade().getNamePt()); // Default to Portuguese
        }

        // Set user info
        if (price.getCreatedBy() != null) {
            dto.setCreatedBy(userMapper.toDTO(price.getCreatedBy()));
        }
        if (price.getVerifiedBy() != null) {
            dto.setVerifiedBy(userMapper.toDTO(price.getVerifiedBy()));
        }

        return dto;
    }

    public PriceDTO toDTOWithLocalizedNames(Price price, String language) {
        PriceDTO dto = toDTO(price);
        if (dto == null) {
            return null;
        }

        // Set localized region name
        if (price.getRegion() != null) {
            dto.setRegionName(price.getRegion().getLocalizedName(language));
        }

        // Set localized quality name
        if (price.getQualityGrade() != null) {
            dto.setQualityName(price.getQualityGrade().getLocalizedName(language));
        }

        return dto;
    }
}


