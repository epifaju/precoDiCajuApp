package gw.precaju.entity;

/**
 * Enum representing the different types of Points of Interest (POI) in the
 * cashew industry
 */
public enum POIType {
    ACHETEUR("ACHETEUR", "Acheteur Agréé", "Acheteurs agréés pour le cajou"),
    COOPERATIVE("COOPERATIVE", "Coopérative", "Coopératives agricoles"),
    ENTREPOT("ENTREPOT", "Entrepôt d'Exportation", "Entrepôts d'exportation");

    private final String code;
    private final String label;
    private final String description;

    POIType(String code, String label, String description) {
        this.code = code;
        this.label = label;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Get POIType from string code (case-insensitive)
     */
    public static POIType fromCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("POI type code cannot be null or empty");
        }

        String normalizedCode = code.trim().toUpperCase();
        for (POIType type : values()) {
            if (type.getCode().equals(normalizedCode) ||
                    type.name().equals(normalizedCode) ||
                    type.getCode().equalsIgnoreCase(code.trim())) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown POI type code: " + code);
    }

    @Override
    public String toString() {
        return code;
    }
}
