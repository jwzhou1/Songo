package com.songo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Request DTO for creating payment intent
 */
public class PaymentIntentRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotNull(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    private String currency = "USD";
    
    private Long shipmentId;
    
    private String description;
    
    // Constructors
    public PaymentIntentRequest() {}
    
    public PaymentIntentRequest(BigDecimal amount, String currency, Long shipmentId) {
        this.amount = amount;
        this.currency = currency;
        this.shipmentId = shipmentId;
    }
    
    // Getters and Setters
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
