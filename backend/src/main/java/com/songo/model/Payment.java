package com.songo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment entity for tracking payments
 */
@Entity
@Table(name = "payments")
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "payment_number", unique = true, nullable = false)
    private String paymentNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;
    
    @NotNull
    @Positive
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "currency", nullable = false)
    private String currency = "USD";
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    // Stripe Integration
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;
    
    @Column(name = "stripe_charge_id")
    private String stripeChargeId;
    
    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;
    
    // Card Information (last 4 digits only for security)
    @Column(name = "card_last_four")
    private String cardLastFour;
    
    @Column(name = "card_brand")
    private String cardBrand;
    
    @Column(name = "card_exp_month")
    private Integer cardExpMonth;
    
    @Column(name = "card_exp_year")
    private Integer cardExpYear;
    
    // Transaction Details
    @Column(name = "transaction_id")
    private String transactionId;
    
    @Column(name = "authorization_code")
    private String authorizationCode;
    
    @Column(name = "failure_reason")
    private String failureReason;
    
    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;
    
    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum PaymentMethod {
        CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, PAYPAL, STRIPE
    }
    
    public enum PaymentStatus {
        PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED
    }
    
    // Constructors
    public Payment() {}
    
    public Payment(User user, BigDecimal amount, PaymentMethod paymentMethod) {
        this.user = user;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (paymentNumber == null) {
            paymentNumber = generatePaymentNumber();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String generatePaymentNumber() {
        return "PAY" + System.currentTimeMillis();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getPaymentNumber() { return paymentNumber; }
    public void setPaymentNumber(String paymentNumber) { this.paymentNumber = paymentNumber; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Shipment getShipment() { return shipment; }
    public void setShipment(Shipment shipment) { this.shipment = shipment; }

    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public void setStripePaymentIntentId(String stripePaymentIntentId) { this.stripePaymentIntentId = stripePaymentIntentId; }
    
    public String getStripeChargeId() { return stripeChargeId; }
    public void setStripeChargeId(String stripeChargeId) { this.stripeChargeId = stripeChargeId; }
    
    public String getStripeCustomerId() { return stripeCustomerId; }
    public void setStripeCustomerId(String stripeCustomerId) { this.stripeCustomerId = stripeCustomerId; }
    
    public String getCardLastFour() { return cardLastFour; }
    public void setCardLastFour(String cardLastFour) { this.cardLastFour = cardLastFour; }
    
    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }
    
    public Integer getCardExpMonth() { return cardExpMonth; }
    public void setCardExpMonth(Integer cardExpMonth) { this.cardExpMonth = cardExpMonth; }
    
    public Integer getCardExpYear() { return cardExpYear; }
    public void setCardExpYear(Integer cardExpYear) { this.cardExpYear = cardExpYear; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    
    public String getAuthorizationCode() { return authorizationCode; }
    public void setAuthorizationCode(String authorizationCode) { this.authorizationCode = authorizationCode; }
    
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    
    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }
    
    public LocalDateTime getRefundedAt() { return refundedAt; }
    public void setRefundedAt(LocalDateTime refundedAt) { this.refundedAt = refundedAt; }
    
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Utility methods
    public boolean isCompleted() {
        return paymentStatus == PaymentStatus.COMPLETED;
    }
    
    public boolean isPending() {
        return paymentStatus == PaymentStatus.PENDING || paymentStatus == PaymentStatus.PROCESSING;
    }
    
    public boolean isFailed() {
        return paymentStatus == PaymentStatus.FAILED || paymentStatus == PaymentStatus.CANCELLED;
    }
    
    public boolean isRefunded() {
        return paymentStatus == PaymentStatus.REFUNDED || paymentStatus == PaymentStatus.PARTIALLY_REFUNDED;
    }
}
