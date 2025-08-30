package gw.precaju.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public class UpdateUserRequest {

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Phone number should be valid")
    private String phone;

    private List<String> preferredRegions;

    // Constructors
    public UpdateUserRequest() {}

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<String> getPreferredRegions() {
        return preferredRegions;
    }

    public void setPreferredRegions(List<String> preferredRegions) {
        this.preferredRegions = preferredRegions;
    }
}


