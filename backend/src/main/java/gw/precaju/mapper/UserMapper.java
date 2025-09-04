package gw.precaju.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import gw.precaju.dto.UserDTO;
import gw.precaju.entity.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class UserMapper {

    private final ObjectMapper objectMapper;

    public UserMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setReputationScore(user.getReputationScore());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setActive(user.getActive());
        dto.setPreferredLanguage(user.getPreferredLanguage());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLoginAt(user.getLastLoginAt());

        // Parse preferred regions JSON
        try {
            if (user.getPreferredRegions() != null) {
                List<String> regions = objectMapper.readValue(
                        user.getPreferredRegions(),
                        new TypeReference<List<String>>() {
                        });
                dto.setPreferredRegions(regions);
            } else {
                dto.setPreferredRegions(new ArrayList<>());
            }
        } catch (JsonProcessingException e) {
            dto.setPreferredRegions(new ArrayList<>());
        }

        return dto;
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setReputationScore(dto.getReputationScore());
        user.setEmailVerified(dto.getEmailVerified());
        user.setActive(dto.getActive());
        user.setPreferredLanguage(dto.getPreferredLanguage());
        user.setCreatedAt(dto.getCreatedAt());
        user.setLastLoginAt(dto.getLastLoginAt());

        // Convert preferred regions to JSON
        try {
            if (dto.getPreferredRegions() != null) {
                String regionsJson = objectMapper.writeValueAsString(dto.getPreferredRegions());
                user.setPreferredRegions(regionsJson);
            } else {
                user.setPreferredRegions("[]");
            }
        } catch (JsonProcessingException e) {
            user.setPreferredRegions("[]");
        }

        return user;
    }

    public void updateEntityFromDTO(UserDTO dto, User user) {
        if (dto == null || user == null) {
            return;
        }

        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getPreferredRegions() != null) {
            try {
                String regionsJson = objectMapper.writeValueAsString(dto.getPreferredRegions());
                user.setPreferredRegions(regionsJson);
            } catch (JsonProcessingException e) {
                // Keep existing value
            }
        }
        if (dto.getPreferredLanguage() != null) {
            user.setPreferredLanguage(dto.getPreferredLanguage());
        }
    }
}
