package gw.precaju.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "verification_logs")
@EntityListeners(AuditingEntityListener.class)
public class VerificationLog {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exportateur_id", referencedColumnName = "id")
    private Exportateur exportateur;

    @Column(name = "user_session", length = 255)
    private String userSession;

    @Column(name = "verification_time", nullable = false)
    private Instant verificationTime;

    @Column(name = "result", nullable = false, length = 50)
    private String result;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Constructors
    public VerificationLog() {
    }

    public VerificationLog(Exportateur exportateur, String userSession, String result, 
                          String ipAddress, String userAgent) {
        this.exportateur = exportateur;
        this.userSession = userSession;
        this.result = result;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.verificationTime = Instant.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Exportateur getExportateur() {
        return exportateur;
    }

    public void setExportateur(Exportateur exportateur) {
        this.exportateur = exportateur;
    }

    public String getUserSession() {
        return userSession;
    }

    public void setUserSession(String userSession) {
        this.userSession = userSession;
    }

    public Instant getVerificationTime() {
        return verificationTime;
    }

    public void setVerificationTime(Instant verificationTime) {
        this.verificationTime = verificationTime;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VerificationLog)) return false;
        VerificationLog that = (VerificationLog) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "VerificationLog{" +
                "id=" + id +
                ", verificationTime=" + verificationTime +
                ", result='" + result + '\'' +
                ", ipAddress='" + ipAddress + '\'' +
                '}';
    }
}
