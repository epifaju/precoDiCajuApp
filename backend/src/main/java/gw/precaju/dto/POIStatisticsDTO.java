package gw.precaju.dto;

/**
 * DTO for POI statistics response
 */
public class POIStatisticsDTO {

    private Long totalCount;
    private Long acheteurCount;
    private Long cooperativeCount;
    private Long entrepotCount;

    // Constructors
    public POIStatisticsDTO() {
    }

    public POIStatisticsDTO(Long totalCount, Long acheteurCount, Long cooperativeCount, Long entrepotCount) {
        this.totalCount = totalCount;
        this.acheteurCount = acheteurCount;
        this.cooperativeCount = cooperativeCount;
        this.entrepotCount = entrepotCount;
    }

    // Getters and Setters
    public Long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Long totalCount) {
        this.totalCount = totalCount;
    }

    public Long getAcheteurCount() {
        return acheteurCount;
    }

    public void setAcheteurCount(Long acheteurCount) {
        this.acheteurCount = acheteurCount;
    }

    public Long getCooperativeCount() {
        return cooperativeCount;
    }

    public void setCooperativeCount(Long cooperativeCount) {
        this.cooperativeCount = cooperativeCount;
    }

    public Long getEntrepotCount() {
        return entrepotCount;
    }

    public void setEntrepotCount(Long entrepotCount) {
        this.entrepotCount = entrepotCount;
    }

    @Override
    public String toString() {
        return "POIStatisticsDTO{" +
                "totalCount=" + totalCount +
                ", acheteurCount=" + acheteurCount +
                ", cooperativeCount=" + cooperativeCount +
                ", entrepotCount=" + entrepotCount +
                '}';
    }
}

