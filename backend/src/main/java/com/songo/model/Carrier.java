package com.songo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Carrier entity representing shipping carriers
 */
@Entity
@Table(name = "carriers")
public class Carrier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    @Column(unique = true, nullable = false)
    private String name;
    
    @NotBlank
    @Size(max = 20)
    @Column(unique = true, nullable = false)
    private String code;
    
    @Size(max = 255)
    @Column(name = "api_endpoint")
    private String apiEndpoint;
    
    @Size(max = 255)
    @Column(name = "logo_url")
    private String logoUrl;
    
    @Size(max = 255)
    private String website;
    
    @Column(name = "supports_tracking")
    private Boolean supportsTracking = true;
    
    @Column(name = "supports_parcel")
    private Boolean supportsParcel = true;
    
    @Column(name = "supports_ltl")
    private Boolean supportsLtl = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "carrier", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Service> services;
    
    @OneToMany(mappedBy = "carrier", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Shipment> shipments;
    
    // Constructors
    public Carrier() {}
    
    public Carrier(String name, String code) {
        this.name = name;
        this.code = code;
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getApiEndpoint() { return apiEndpoint; }
    public void setApiEndpoint(String apiEndpoint) { this.apiEndpoint = apiEndpoint; }
    
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    
    public Boolean getSupportsTracking() { return supportsTracking; }
    public void setSupportsTracking(Boolean supportsTracking) { this.supportsTracking = supportsTracking; }
    
    public Boolean getSupportsParcel() { return supportsParcel; }
    public void setSupportsParcel(Boolean supportsParcel) { this.supportsParcel = supportsParcel; }
    
    public Boolean getSupportsLtl() { return supportsLtl; }
    public void setSupportsLtl(Boolean supportsLtl) { this.supportsLtl = supportsLtl; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<Service> getServices() { return services; }
    public void setServices(List<Service> services) { this.services = services; }
    
    public List<Shipment> getShipments() { return shipments; }
    public void setShipments(List<Shipment> shipments) { this.shipments = shipments; }
}
