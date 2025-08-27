package com.songo.service;

import com.songo.model.Payment;
import com.songo.model.Shipment;
import com.songo.model.User;
import com.songo.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for handling payments and Stripe integration
 */
@Service
@Transactional
public class PaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    
    private final PaymentRepository paymentRepository;
    
    @Value("${stripe.api-key}")
    private String stripeApiKey;
    
    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    
    /**
     * Create a payment intent with Stripe
     */
    public Payment createPaymentIntent(User user, Shipment shipment, BigDecimal amount, String currency) {
        try {
            Stripe.apiKey = stripeApiKey;
            
            // Convert amount to cents for Stripe
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
            
            // Create payment intent with Stripe
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency.toLowerCase())
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .putMetadata("user_id", user.getId().toString())
                .putMetadata("shipment_id", shipment != null ? shipment.getId().toString() : "")
                .build();
            
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            
            // Create payment record
            Payment payment = new Payment(user, amount, Payment.PaymentMethod.STRIPE);
            payment.setShipment(shipment);
            payment.setCurrency(currency);
            payment.setStripePaymentIntentId(paymentIntent.getId());
            payment.setPaymentStatus(Payment.PaymentStatus.PENDING);
            
            return paymentRepository.save(payment);
            
        } catch (StripeException e) {
            logger.error("Error creating Stripe payment intent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }
    
    /**
     * Confirm payment with Stripe
     */
    public Payment confirmPayment(String paymentIntentId, String paymentMethodId) {
        try {
            Stripe.apiKey = stripeApiKey;
            
            // Find payment by Stripe payment intent ID
            Optional<Payment> paymentOpt = paymentRepository.findByStripePaymentIntentId(paymentIntentId);
            if (paymentOpt.isEmpty()) {
                throw new RuntimeException("Payment not found for payment intent: " + paymentIntentId);
            }
            
            Payment payment = paymentOpt.get();
            
            // Confirm payment intent with Stripe
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                .setPaymentMethod(paymentMethodId)
                .build();
            
            PaymentIntent confirmedIntent = paymentIntent.confirm(confirmParams);
            
            // Update payment status based on Stripe response
            updatePaymentFromStripeIntent(payment, confirmedIntent);
            
            return paymentRepository.save(payment);
            
        } catch (StripeException e) {
            logger.error("Error confirming Stripe payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage());
        }
    }
    
    /**
     * Process webhook from Stripe
     */
    public void processStripeWebhook(String paymentIntentId, String status) {
        try {
            Optional<Payment> paymentOpt = paymentRepository.findByStripePaymentIntentId(paymentIntentId);
            if (paymentOpt.isEmpty()) {
                logger.warn("Payment not found for webhook payment intent: {}", paymentIntentId);
                return;
            }
            
            Payment payment = paymentOpt.get();
            
            // Update payment status based on webhook
            switch (status) {
                case "succeeded":
                    payment.setPaymentStatus(Payment.PaymentStatus.COMPLETED);
                    payment.setProcessedAt(LocalDateTime.now());
                    break;
                case "processing":
                    payment.setPaymentStatus(Payment.PaymentStatus.PROCESSING);
                    break;
                case "payment_failed":
                    payment.setPaymentStatus(Payment.PaymentStatus.FAILED);
                    break;
                case "canceled":
                    payment.setPaymentStatus(Payment.PaymentStatus.CANCELLED);
                    break;
            }
            
            paymentRepository.save(payment);
            
        } catch (Exception e) {
            logger.error("Error processing Stripe webhook: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Refund a payment
     */
    public Payment refundPayment(Long paymentId, BigDecimal refundAmount, String reason) {
        try {
            Stripe.apiKey = stripeApiKey;
            
            Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            if (!payment.isCompleted()) {
                throw new RuntimeException("Cannot refund non-completed payment");
            }
            
            // Create refund with Stripe
            Map<String, Object> refundParams = new HashMap<>();
            refundParams.put("payment_intent", payment.getStripePaymentIntentId());
            refundParams.put("amount", refundAmount.multiply(BigDecimal.valueOf(100)).longValue());
            refundParams.put("reason", reason);
            
            com.stripe.model.Refund refund = com.stripe.model.Refund.create(refundParams);
            
            // Update payment record
            payment.setRefundAmount(refundAmount);
            payment.setRefundedAt(LocalDateTime.now());
            
            if (refundAmount.compareTo(payment.getAmount()) >= 0) {
                payment.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
            } else {
                payment.setPaymentStatus(Payment.PaymentStatus.PARTIALLY_REFUNDED);
            }
            
            return paymentRepository.save(payment);
            
        } catch (StripeException e) {
            logger.error("Error refunding payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to refund payment: " + e.getMessage());
        }
    }
    
    /**
     * Get payment by ID
     */
    @Transactional(readOnly = true)
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }
    
    /**
     * Get payments by user
     */
    @Transactional(readOnly = true)
    public Page<Payment> getPaymentsByUser(User user, Pageable pageable) {
        return paymentRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }
    
    /**
     * Get payment statistics for user
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentStatistics(User user) {
        Map<String, Object> stats = new HashMap<>();
        
        BigDecimal totalPaid = paymentRepository.calculateTotalPaymentsByUser(user);
        List<Payment> successfulPayments = paymentRepository.findSuccessfulPaymentsByUser(user);
        boolean hasPayments = paymentRepository.hasSuccessfulPayments(user);
        
        stats.put("totalPaid", totalPaid);
        stats.put("paymentCount", successfulPayments.size());
        stats.put("hasPayments", hasPayments);
        stats.put("recentPayments", successfulPayments.stream().limit(5).toList());
        
        return stats;
    }
    
    /**
     * Update payment from Stripe PaymentIntent
     */
    private void updatePaymentFromStripeIntent(Payment payment, PaymentIntent paymentIntent) {
        payment.setStripeChargeId(paymentIntent.getLatestCharge());
        
        switch (paymentIntent.getStatus()) {
            case "succeeded":
                payment.setPaymentStatus(Payment.PaymentStatus.COMPLETED);
                payment.setProcessedAt(LocalDateTime.now());
                break;
            case "processing":
                payment.setPaymentStatus(Payment.PaymentStatus.PROCESSING);
                break;
            case "requires_payment_method":
            case "requires_confirmation":
                payment.setPaymentStatus(Payment.PaymentStatus.PENDING);
                break;
            case "canceled":
                payment.setPaymentStatus(Payment.PaymentStatus.CANCELLED);
                break;
            default:
                payment.setPaymentStatus(Payment.PaymentStatus.FAILED);
                payment.setFailureReason("Unknown status: " + paymentIntent.getStatus());
        }
    }
}
