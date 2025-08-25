package com.songo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Package entity representing individual packages within a shipment
 */
@Entity
@Table(name = "packages")
public class Package {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "package_type")
    private PackageType packageType = PackageType.BOX;
    
    @NotNull
    @Positive
    @Column(precision = 8, scale = 2, nullable = false)
    private BigDecimal length;
    
    @NotNull
    @Positive
    @Column(precision = 8, scale = 2, nullable = false)
    private BigDecimal width;
    
    @NotNull
    @Positive
    @Column(precision = 8, scale = 2, nullable = false)
    private BigDecimal height;
    
    @NotNull
    @Positive
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal weight;
    
    @Column(name = "declared_value", precision = 10, scale = 2)
    private BigDecimal declaredValue;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Enums
    public enum PackageType {
        BOX, ENVELOPE, PALLET, TUBE, OTHER
    }
    
    // Constructors
    public Package() {}
    
    public Package(Shipment shipment, PackageType packageType, BigDecimal length, 
                   BigDecimal width, BigDecimal height, BigDecimal weight) {
        this.shipment = shipment;
        this.packageType = packageType;
        this.length = length;
        this.width = width;
        this.height = height;
        this.weight = weight;
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Shipment getShipment() { return shipment; }
    public void setShipment(Shipment shipment) { this.shipment = shipment; }
    
    public PackageType getPackageType() { return packageType; }
    public void setPackageType(PackageType packageType) { this.packageType = packageType; }
    
    public BigDecimal getLength() { return length; }
    public void setLength(BigDecimal length) { this.length = length; }
    
    public BigDecimal getWidth() { return width; }
    public void setWidth(BigDecimal width) { this.width = width; }
    
    public BigDecimal getHeight() { return height; }
    public void setHeight(BigDecimal height) { this.height = height; }
    
    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }
    
    public BigDecimal getDeclaredValue() { return declaredValue; }
    public void setDeclaredValue(BigDecimal declaredValue) { this.declaredValue = declaredValue; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    // Utility methods
    public BigDecimal getVolume() {
        return length.multiply(width).multiply(height);
    }
    
    public String getDimensions() {
        return length + " x " + width + " x " + height + " cm";
    }
    
    public BigDecimal getVolumetricWeight() {
        // Standard volumetric weight calculation (L x W x H / 5000)
        return getVolume().divide(new BigDecimal("5000"), 2, BigDecimal.ROUND_HALF_UP);
    }
    
    public BigDecimal getBillableWeight() {
        // Return the greater of actual weight or volumetric weight
        BigDecimal volumetricWeight = getVolumetricWeight();
        return weight.compareTo(volumetricWeight) > 0 ? weight : volumetricWeight;
    }
}
