package com.songo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service entity representing carrier services
 */
@Entity
@Table(name = "services", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"carrier_id", "code"})
})
public class Service {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrier_id", nullable = false)
    private Carrier carrier;
    
    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;
    
    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String code;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "max_weight", precision = 10, scale = 2)
    private BigDecimal maxWeight;
    
    @Size(max = 50)
    @Column(name = "max_dimensions")
    private String maxDimensions;
    
    @Column(name = "transit_time_min")
    private Integer transitTimeMin;
    
    @Column(name = "transit_time_max")
    private Integer transitTimeMax;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Shipment> shipments;
    
    // Enums
    public enum ServiceType {
        PARCEL, LTL, EXPRESS, GROUND
    }
    
    // Constructors
    public Service() {}
    
    public Service(Carrier carrier, String name, String code, ServiceType serviceType) {
        this.carrier = carrier;
        this.name = name;
        this.code = code;
        this.serviceType = serviceType;
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
    
    public Carrier getCarrier() { return carrier; }
    public void setCarrier(Carrier carrier) { this.carrier = carrier; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getMaxWeight() { return maxWeight; }
    public void setMaxWeight(BigDecimal maxWeight) { this.maxWeight = maxWeight; }
    
    public String getMaxDimensions() { return maxDimensions; }
    public void setMaxDimensions(String maxDimensions) { this.maxDimensions = maxDimensions; }
    
    public Integer getTransitTimeMin() { return transitTimeMin; }
    public void setTransitTimeMin(Integer transitTimeMin) { this.transitTimeMin = transitTimeMin; }
    
    public Integer getTransitTimeMax() { return transitTimeMax; }
    public void setTransitTimeMax(Integer transitTimeMax) { this.transitTimeMax = transitTimeMax; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<Shipment> getShipments() { return shipments; }
    public void setShipments(List<Shipment> shipments) { this.shipments = shipments; }
    
    // Utility methods
    public String getTransitTimeRange() {
        if (transitTimeMin != null && transitTimeMax != null) {
            if (transitTimeMin.equals(transitTimeMax)) {
                return transitTimeMin + " day" + (transitTimeMin > 1 ? "s" : "");
            } else {
                return transitTimeMin + "-" + transitTimeMax + " days";
            }
        }
        return "N/A";
    }
}
