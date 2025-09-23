package gw.precaju.mapper;

import gw.precaju.dto.POIDTO;
import gw.precaju.dto.request.CreatePOIRequest;
import gw.precaju.dto.request.UpdatePOIRequest;
import gw.precaju.entity.POI;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface POIMapper {

    /**
     * Convert POI entity to POI DTO
     * Computed fields (formattedPhone, callUrl, displayType, markerColor, markerIcon) 
     * are calculated by the DTO getters, not mapped here
     */
    POIDTO toDTO(POI poi);

    /**
     * Convert list of POI entities to list of POI DTOs
     */
    List<POIDTO> toDTOList(List<POI> pois);

    /**
     * Convert CreatePOIRequest to POI entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    POI toEntity(CreatePOIRequest request);

    /**
     * Update POI entity with UpdatePOIRequest data
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(UpdatePOIRequest request, @MappingTarget POI poi);

    /**
     * Create a new POI entity from CreatePOIRequest
     */
    default POI createFromRequest(CreatePOIRequest request, String createdBy) {
        POI poi = toEntity(request);
        poi.setCreatedBy(createdBy);
        return poi;
    }
}
