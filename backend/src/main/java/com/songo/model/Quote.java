package com.songo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Quote entity for shipping quotes
 */
@Entity
@Table(name = "quotes")
public class Quote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "quote_number", unique = true, nullable = false)
    private String quoteNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    // Origin details
    @NotBlank(message = "Origin address is required")
    @Column(name = "origin_address", nullable = false)
    private String originAddress;
    
    @NotBlank(message = "Origin city is required")
    @Column(name = "origin_city", nullable = false)
    private String originCity;
    
    @NotBlank(message = "Origin state is required")
    @Column(name = "origin_state", nullable = false)
    private String originState;
    
    @NotBlank(message = "Origin zip code is required")
    @Column(name = "origin_zip", nullable = false)
    private String originZip;
    
    @NotBlank(message = "Origin country is required")
    @Column(name = "origin_country", nullable = false)
    private String originCountry;
    
    // Destination details
    @NotBlank(message = "Destination address is required")
    @Column(name = "destination_address", nullable = false)
    private String destinationAddress;
    
    @NotBlank(message = "Destination city is required")
    @Column(name = "destination_city", nullable = false)
    private String destinationCity;
    
    @NotBlank(message = "Destination state is required")
    @Column(name = "destination_state", nullable = false)
    private String destinationState;
    
    @NotBlank(message = "Destination zip code is required")
    @Column(name = "destination_zip", nullable = false)
    private String destinationZip;
    
    @NotBlank(message = "Destination country is required")
    @Column(name = "destination_country", nullable = false)
    private String destinationCountry;
    
    // Shipment details
    @Enumerated(EnumType.STRING)
    @Column(name = "shipment_type", nullable = false)
    private ShipmentType shipmentType;
    
    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    @Column(nullable = false)
    private Double weight;
    
    @Column(name = "weight_unit")
    private String weightUnit = "lbs";
    
    @Column(name = "dimensions_length")
    private Double dimensionsLength;
    
    @Column(name = "dimensions_width")
    private Double dimensionsWidth;
    
    @Column(name = "dimensions_height")
    private Double dimensionsHeight;
    
    @Column(name = "dimensions_unit")
    private String dimensionsUnit = "in";
    
    @Column(name = "package_count")
    private Integer packageCount = 1;
    
    @Column(name = "cargo_description")
    private String cargoDescription;
    
    @Column(name = "cargo_value")
    private BigDecimal cargoValue;
    
    // Quote details
    @Column(name = "estimated_price")
    private BigDecimal estimatedPrice;
    
    @Column(name = "estimated_transit_days")
    private Integer estimatedTransitDays;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuoteStatus status = QuoteStatus.PENDING;
    
    @Column(name = "valid_until")
    private LocalDateTime validUntil;
    
    @Column(name = "special_instructions")
    private String specialInstructions;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum ShipmentType {
        LTL, // Less Than Truckload
        FTL, // Full Truckload
        PARCEL,
        FREIGHT,
        EXPEDITED
    }
    
    public enum QuoteStatus {
        PENDING,
        QUOTED,
        ACCEPTED,
        REJECTED,
        EXPIRED,
        SAVED,
        CONVERTED_TO_SHIPMENT
    }
    
    // Constructors
    public Quote() {}
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (quoteNumber == null) {
            quoteNumber = generateQuoteNumber();
        }
        if (validUntil == null) {
            validUntil = LocalDateTime.now().plusDays(7); // Valid for 7 days
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String generateQuoteNumber() {
        return "QT" + System.currentTimeMillis();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getQuoteNumber() { return quoteNumber; }
    public void setQuoteNumber(String quoteNumber) { this.quoteNumber = quoteNumber; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getOriginAddress() { return originAddress; }
    public void setOriginAddress(String originAddress) { this.originAddress = originAddress; }
    
    public String getOriginCity() { return originCity; }
    public void setOriginCity(String originCity) { this.originCity = originCity; }
    
    public String getOriginState() { return originState; }
    public void setOriginState(String originState) { this.originState = originState; }
    
    public String getOriginZip() { return originZip; }
    public void setOriginZip(String originZip) { this.originZip = originZip; }
    
    public String getOriginCountry() { return originCountry; }
    public void setOriginCountry(String originCountry) { this.originCountry = originCountry; }
    
    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }
    
    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }
    
    public String getDestinationState() { return destinationState; }
    public void setDestinationState(String destinationState) { this.destinationState = destinationState; }
    
    public String getDestinationZip() { return destinationZip; }
    public void setDestinationZip(String destinationZip) { this.destinationZip = destinationZip; }
    
    public String getDestinationCountry() { return destinationCountry; }
    public void setDestinationCountry(String destinationCountry) { this.destinationCountry = destinationCountry; }
    
    public ShipmentType getShipmentType() { return shipmentType; }
    public void setShipmentType(ShipmentType shipmentType) { this.shipmentType = shipmentType; }
    
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    
    public String getWeightUnit() { return weightUnit; }
    public void setWeightUnit(String weightUnit) { this.weightUnit = weightUnit; }
    
    public Double getDimensionsLength() { return dimensionsLength; }
    public void setDimensionsLength(Double dimensionsLength) { this.dimensionsLength = dimensionsLength; }
    
    public Double getDimensionsWidth() { return dimensionsWidth; }
    public void setDimensionsWidth(Double dimensionsWidth) { this.dimensionsWidth = dimensionsWidth; }
    
    public Double getDimensionsHeight() { return dimensionsHeight; }
    public void setDimensionsHeight(Double dimensionsHeight) { this.dimensionsHeight = dimensionsHeight; }
    
    public String getDimensionsUnit() { return dimensionsUnit; }
    public void setDimensionsUnit(String dimensionsUnit) { this.dimensionsUnit = dimensionsUnit; }
    
    public Integer getPackageCount() { return packageCount; }
    public void setPackageCount(Integer packageCount) { this.packageCount = packageCount; }
    
    public String getCargoDescription() { return cargoDescription; }
    public void setCargoDescription(String cargoDescription) { this.cargoDescription = cargoDescription; }
    
    public BigDecimal getCargoValue() { return cargoValue; }
    public void setCargoValue(BigDecimal cargoValue) { this.cargoValue = cargoValue; }
    
    public BigDecimal getEstimatedPrice() { return estimatedPrice; }
    public void setEstimatedPrice(BigDecimal estimatedPrice) { this.estimatedPrice = estimatedPrice; }
    
    public Integer getEstimatedTransitDays() { return estimatedTransitDays; }
    public void setEstimatedTransitDays(Integer estimatedTransitDays) { this.estimatedTransitDays = estimatedTransitDays; }
    
    public QuoteStatus getStatus() { return status; }
    public void setStatus(QuoteStatus status) { this.status = status; }
    
    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
