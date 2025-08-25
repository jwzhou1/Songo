package com.songo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * TrackingEvent entity for shipment tracking
 */
@Entity
@Table(name = "tracking_events")
public class TrackingEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;
    
    @NotBlank(message = "Event type is required")
    @Column(name = "event_type", nullable = false)
    private String eventType;
    
    @NotBlank(message = "Status is required")
    @Column(nullable = false)
    private String status;
    
    @Column(name = "status_description")
    private String statusDescription;
    
    @NotNull(message = "Event date is required")
    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;
    
    @Column(name = "location_city")
    private String locationCity;
    
    @Column(name = "location_state")
    private String locationState;
    
    @Column(name = "location_country")
    private String locationCountry;
    
    @Column(name = "location_zip")
    private String locationZip;
    
    @Column(name = "carrier_code")
    private String carrierCode;
    
    @Column(name = "carrier_name")
    private String carrierName;
    
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    @Column(name = "delivery_signature")
    private String deliverySignature;
    
    @Column(name = "delivery_instructions")
    private String deliveryInstructions;
    
    @Column(name = "estimated_delivery")
    private LocalDateTime estimatedDelivery;
    
    @Column(name = "actual_delivery")
    private LocalDateTime actualDelivery;
    
    @Column(name = "exception_code")
    private String exceptionCode;
    
    @Column(name = "exception_description")
    private String exceptionDescription;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public TrackingEvent() {}
    
    public TrackingEvent(Shipment shipment, String eventType, String status, LocalDateTime eventDate) {
        this.shipment = shipment;
        this.eventType = eventType;
        this.status = status;
        this.eventDate = eventDate;
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
    
    public Shipment getShipment() { return shipment; }
    public void setShipment(Shipment shipment) { this.shipment = shipment; }
    
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getStatusDescription() { return statusDescription; }
    public void setStatusDescription(String statusDescription) { this.statusDescription = statusDescription; }
    
    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    
    public String getLocationCity() { return locationCity; }
    public void setLocationCity(String locationCity) { this.locationCity = locationCity; }
    
    public String getLocationState() { return locationState; }
    public void setLocationState(String locationState) { this.locationState = locationState; }
    
    public String getLocationCountry() { return locationCountry; }
    public void setLocationCountry(String locationCountry) { this.locationCountry = locationCountry; }
    
    public String getLocationZip() { return locationZip; }
    public void setLocationZip(String locationZip) { this.locationZip = locationZip; }
    
    public String getCarrierCode() { return carrierCode; }
    public void setCarrierCode(String carrierCode) { this.carrierCode = carrierCode; }
    
    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }
    
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    
    public String getDeliverySignature() { return deliverySignature; }
    public void setDeliverySignature(String deliverySignature) { this.deliverySignature = deliverySignature; }
    
    public String getDeliveryInstructions() { return deliveryInstructions; }
    public void setDeliveryInstructions(String deliveryInstructions) { this.deliveryInstructions = deliveryInstructions; }
    
    public LocalDateTime getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(LocalDateTime estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }
    
    public LocalDateTime getActualDelivery() { return actualDelivery; }
    public void setActualDelivery(LocalDateTime actualDelivery) { this.actualDelivery = actualDelivery; }
    
    public String getExceptionCode() { return exceptionCode; }
    public void setExceptionCode(String exceptionCode) { this.exceptionCode = exceptionCode; }
    
    public String getExceptionDescription() { return exceptionDescription; }
    public void setExceptionDescription(String exceptionDescription) { this.exceptionDescription = exceptionDescription; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Utility methods
    public String getFullLocation() {
        StringBuilder location = new StringBuilder();
        if (locationCity != null) location.append(locationCity);
        if (locationState != null) {
            if (location.length() > 0) location.append(", ");
            location.append(locationState);
        }
        if (locationCountry != null) {
            if (location.length() > 0) location.append(", ");
            location.append(locationCountry);
        }
        return location.toString();
    }
    
    public boolean isDelivered() {
        return "DELIVERED".equalsIgnoreCase(status) || actualDelivery != null;
    }
    
    public boolean hasException() {
        return exceptionCode != null && !exceptionCode.trim().isEmpty();
    }
}
