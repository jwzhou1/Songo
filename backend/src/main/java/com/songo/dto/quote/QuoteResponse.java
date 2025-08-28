package com.songo.dto.quote;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Quote response DTO for carrier quote responses
 */
public class QuoteResponse {
    
    private String carrierName;
    private String serviceName;
    private String serviceCode;
    private BigDecimal price;
    private String currency;
    private Integer estimatedTransitDays;
    private LocalDateTime estimatedDeliveryDate;
    private String notes;
    private boolean available = true;
    
    // Constructors
    public QuoteResponse() {}
    
    public QuoteResponse(String carrierName, String serviceName, String serviceCode, 
                        BigDecimal price, String currency, Integer estimatedTransitDays) {
        this.carrierName = carrierName;
        this.serviceName = serviceName;
        this.serviceCode = serviceCode;
        this.price = price;
        this.currency = currency;
        this.estimatedTransitDays = estimatedTransitDays;
        if (estimatedTransitDays != null) {
            this.estimatedDeliveryDate = LocalDateTime.now().plusDays(estimatedTransitDays);
        }
    }
    
    // Getters and Setters
    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }
    
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    
    public String getServiceCode() { return serviceCode; }
    public void setServiceCode(String serviceCode) { this.serviceCode = serviceCode; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Integer getEstimatedTransitDays() { return estimatedTransitDays; }
    public void setEstimatedTransitDays(Integer estimatedTransitDays) { 
        this.estimatedTransitDays = estimatedTransitDays;
        if (estimatedTransitDays != null) {
            this.estimatedDeliveryDate = LocalDateTime.now().plusDays(estimatedTransitDays);
        }
    }
    
    public LocalDateTime getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) { 
        this.estimatedDeliveryDate = estimatedDeliveryDate; 
    }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    
    // Utility methods
    public String getFormattedPrice() {
        if (price != null && currency != null) {
            return String.format("%.2f %s", price, currency);
        }
        return "N/A";
    }
    
    public String getTransitTimeDescription() {
        if (estimatedTransitDays != null) {
            if (estimatedTransitDays == 1) {
                return "1 business day";
            } else {
                return estimatedTransitDays + " business days";
            }
        }
        return "N/A";
    }
    
    @Override
    public String toString() {
        return String.format("QuoteResponse{carrierName='%s', serviceName='%s', price=%s %s, transitDays=%d}", 
                           carrierName, serviceName, price, currency, estimatedTransitDays);
    }
}
