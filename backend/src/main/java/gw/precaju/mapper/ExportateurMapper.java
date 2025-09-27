package gw.precaju.mapper;

import gw.precaju.dto.ExportateurDTO;
import gw.precaju.dto.VerificationResultDTO;
import gw.precaju.entity.Exportateur;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDate;

@Mapper(componentModel = "spring")
public interface ExportateurMapper {

    @Mapping(source = "region.code", target = "regionCode")
    @Mapping(source = "region.namePt", target = "regionName")
    @Mapping(target = "actif", expression = "java(entity.isActif())")
    @Mapping(target = "expire", expression = "java(entity.isExpire())")
    @Mapping(target = "suspendu", expression = "java(entity.isSuspendu())")
    ExportateurDTO toDTO(Exportateur entity);

    @Mapping(source = "regionCode", target = "region", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "qrCodeToken", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "verificationLogs", ignore = true)
    Exportateur toEntity(ExportateurDTO dto);

    @Mapping(source = "region.code", target = "regionCode")
    @Mapping(source = "region.namePt", target = "regionName")
    @Mapping(target = "actif", expression = "java(entity.isActif())")
    @Mapping(target = "expire", expression = "java(entity.isExpire())")
    @Mapping(target = "suspendu", expression = "java(entity.isSuspendu())")
    @Mapping(target = "success", ignore = true)
    @Mapping(target = "message", ignore = true)
    @Mapping(target = "result", ignore = true)
    @Mapping(target = "exportateurId", ignore = true)
    @Mapping(target = "verificationTime", ignore = true)
    VerificationResultDTO toVerificationResultDTO(Exportateur entity);

    default VerificationResultDTO toSuccessVerificationResult(Exportateur entity) {
        ExportateurDTO dto = toDTO(entity);
        return VerificationResultDTO.success(dto);
    }
}
