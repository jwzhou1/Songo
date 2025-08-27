package com.songo.dto;

import java.math.BigDecimal;

/**
 * Response DTO for payment intent creation
 */
public class PaymentIntentResponse {
    
    private Long paymentId;
    private String clientSecret;
    private BigDecimal amount;
    private String currency;
    private String status;
    
    // Constructors
    public PaymentIntentResponse() {}
    
    public PaymentIntentResponse(Long paymentId, String clientSecret, BigDecimal amount, String currency) {
        this.paymentId = paymentId;
        this.clientSecret = clientSecret;
        this.amount = amount;
        this.currency = currency;
    }
    
    // Getters and Setters
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
