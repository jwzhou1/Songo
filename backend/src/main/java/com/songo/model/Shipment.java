package com.songo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Shipment entity representing customer shipments
 */
@Entity
@Table(name = "shipments")
public class Shipment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotNull
    @Size(max = 50)
    @Column(name = "shipment_number", unique = true, nullable = false)
    private String shipmentNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrier_id", nullable = false)
    private Carrier carrier;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "shipment_type", nullable = false)
    private ShipmentType shipmentType;
    
    // Origin and destination
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_address_id", nullable = false)
    private Address originAddress;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_address_id", nullable = false)
    private Address destinationAddress;
    
    // Package details
    @NotNull
    @Column(name = "total_weight", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalWeight;
    
    @Column(name = "total_value", precision = 10, scale = 2)
    private BigDecimal totalValue;
    
    @Size(max = 3)
    private String currency = "CAD";
    
    // Pricing
    @Column(name = "base_cost", precision = 10, scale = 2)
    private BigDecimal baseCost;
    
    @Column(name = "fuel_surcharge", precision = 10, scale = 2)
    private BigDecimal fuelSurcharge;
    
    @Column(name = "taxes", precision = 10, scale = 2)
    private BigDecimal taxes;
    
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    // Tracking
    @Size(max = 100)
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    @Size(max = 100)
    @Column(name = "carrier_reference")
    private String carrierReference;
    
    // Dates
    @Column(name = "pickup_date")
    private LocalDate pickupDate;
    
    @Column(name = "delivery_date")
    private LocalDate deliveryDate;
    
    @Column(name = "estimated_delivery")
    private LocalDate estimatedDelivery;
    
    // Special instructions
    @Column(name = "pickup_instructions", columnDefinition = "TEXT")
    private String pickupInstructions;
    
    @Column(name = "delivery_instructions", columnDefinition = "TEXT")
    private String deliveryInstructions;
    
    // Metadata
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Package> packages;
    
    // Enums
    public enum ShipmentStatus {
        DRAFT, QUOTED, BOOKED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED, EXCEPTION
    }
    
    public enum ShipmentType {
        PARCEL, LTL
    }
    
    // Constructors
    public Shipment() {}
    
    public Shipment(User user, String shipmentNumber, Carrier carrier, Service service, 
                   ShipmentType shipmentType, Address originAddress, Address destinationAddress) {
        this.user = user;
        this.shipmentNumber = shipmentNumber;
        this.carrier = carrier;
        this.service = service;
        this.shipmentType = shipmentType;
        this.originAddress = originAddress;
        this.destinationAddress = destinationAddress;
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
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getShipmentNumber() { return shipmentNumber; }
    public void setShipmentNumber(String shipmentNumber) { this.shipmentNumber = shipmentNumber; }
    
    public Carrier getCarrier() { return carrier; }
    public void setCarrier(Carrier carrier) { this.carrier = carrier; }
    
    public Service getService() { return service; }
    public void setService(Service service) { this.service = service; }
    
    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }
    
    public ShipmentType getShipmentType() { return shipmentType; }
    public void setShipmentType(ShipmentType shipmentType) { this.shipmentType = shipmentType; }
    
    public Address getOriginAddress() { return originAddress; }
    public void setOriginAddress(Address originAddress) { this.originAddress = originAddress; }
    
    public Address getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(Address destinationAddress) { this.destinationAddress = destinationAddress; }
    
    public BigDecimal getTotalWeight() { return totalWeight; }
    public void setTotalWeight(BigDecimal totalWeight) { this.totalWeight = totalWeight; }
    
    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public BigDecimal getBaseCost() { return baseCost; }
    public void setBaseCost(BigDecimal baseCost) { this.baseCost = baseCost; }
    
    public BigDecimal getFuelSurcharge() { return fuelSurcharge; }
    public void setFuelSurcharge(BigDecimal fuelSurcharge) { this.fuelSurcharge = fuelSurcharge; }
    
    public BigDecimal getTaxes() { return taxes; }
    public void setTaxes(BigDecimal taxes) { this.taxes = taxes; }
    
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    
    public String getCarrierReference() { return carrierReference; }
    public void setCarrierReference(String carrierReference) { this.carrierReference = carrierReference; }
    
    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }
    
    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }
    
    public LocalDate getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(LocalDate estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }
    
    public String getPickupInstructions() { return pickupInstructions; }
    public void setPickupInstructions(String pickupInstructions) { this.pickupInstructions = pickupInstructions; }
    
    public String getDeliveryInstructions() { return deliveryInstructions; }
    public void setDeliveryInstructions(String deliveryInstructions) { this.deliveryInstructions = deliveryInstructions; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<Package> getPackages() { return packages; }
    public void setPackages(List<Package> packages) { this.packages = packages; }
    
    // Utility methods
    public boolean isDelivered() {
        return status == ShipmentStatus.DELIVERED;
    }
    
    public boolean isInTransit() {
        return status == ShipmentStatus.IN_TRANSIT || status == ShipmentStatus.PICKED_UP;
    }
    
    public boolean canBeCancelled() {
        return status == ShipmentStatus.DRAFT || status == ShipmentStatus.QUOTED || status == ShipmentStatus.BOOKED;
    }
}
