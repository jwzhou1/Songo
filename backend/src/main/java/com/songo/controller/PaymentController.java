package com.songo.controller;

import com.songo.dto.PaymentIntentRequest;
import com.songo.dto.PaymentIntentResponse;
import com.songo.dto.PaymentResponse;
import com.songo.model.Payment;
import com.songo.model.Shipment;
import com.songo.model.User;
import com.songo.service.PaymentService;
import com.songo.service.ShipmentService;
import com.songo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.Map;

/**
 * REST Controller for payment operations
 */
@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment", description = "Payment management operations")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    
    private final PaymentService paymentService;
    private final UserService userService;
    private final ShipmentService shipmentService;
    
    public PaymentController(PaymentService paymentService, UserService userService, ShipmentService shipmentService) {
        this.paymentService = paymentService;
        this.userService = userService;
        this.shipmentService = shipmentService;
    }
    
    /**
     * Create payment intent for shipment
     */
    @PostMapping("/create-intent")
    @Operation(summary = "Create payment intent", description = "Create a Stripe payment intent for a shipment")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @Valid @RequestBody PaymentIntentRequest request,
            Authentication authentication) {
        
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Shipment shipment = null;
            if (request.getShipmentId() != null) {
                shipment = shipmentService.getShipmentById(request.getShipmentId())
                    .orElseThrow(() -> new RuntimeException("Shipment not found"));
                
                // Verify user owns the shipment
                if (!shipment.getUser().getId().equals(user.getId())) {
                    return ResponseEntity.badRequest().build();
                }
            }
            
            Payment payment = paymentService.createPaymentIntent(
                user, 
                shipment, 
                request.getAmount(), 
                request.getCurrency()
            );
            
            PaymentIntentResponse response = new PaymentIntentResponse();
            response.setPaymentId(payment.getId());
            response.setClientSecret(payment.getStripePaymentIntentId()); // This would be the client secret in real implementation
            response.setAmount(payment.getAmount());
            response.setCurrency(payment.getCurrency());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error creating payment intent: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Confirm payment
     */
    @PostMapping("/confirm")
    @Operation(summary = "Confirm payment", description = "Confirm a payment with Stripe")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @RequestParam String paymentIntentId,
            @RequestParam String paymentMethodId,
            Authentication authentication) {
        
        try {
            Payment payment = paymentService.confirmPayment(paymentIntentId, paymentMethodId);
            
            PaymentResponse response = PaymentResponse.fromPayment(payment);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error confirming payment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get payment by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get payment", description = "Get payment details by ID")
    public ResponseEntity<PaymentResponse> getPayment(
            @PathVariable Long id,
            Authentication authentication) {
        
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Payment payment = paymentService.getPaymentById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            // Verify user owns the payment
            if (!payment.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().build();
            }
            
            PaymentResponse response = PaymentResponse.fromPayment(payment);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error getting payment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get user's payment history
     */
    @GetMapping("/history")
    @Operation(summary = "Get payment history", description = "Get user's payment history with pagination")
    public ResponseEntity<Page<PaymentResponse>> getPaymentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Payment> payments = paymentService.getPaymentsByUser(user, pageable);
            
            Page<PaymentResponse> response = payments.map(PaymentResponse::fromPayment);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error getting payment history: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get payment statistics
     */
    @GetMapping("/statistics")
    @Operation(summary = "Get payment statistics", description = "Get user's payment statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics(Authentication authentication) {
        
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> statistics = paymentService.getPaymentStatistics(user);
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            logger.error("Error getting payment statistics: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Refund payment
     */
    @PostMapping("/{id}/refund")
    @Operation(summary = "Refund payment", description = "Process a refund for a payment")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Payment payment = paymentService.getPaymentById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            // Verify user owns the payment
            if (!payment.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().build();
            }
            
            Payment refundedPayment = paymentService.refundPayment(id, amount, reason);
            
            PaymentResponse response = PaymentResponse.fromPayment(refundedPayment);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error refunding payment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Stripe webhook endpoint
     */
    @PostMapping("/webhook/stripe")
    @Operation(summary = "Stripe webhook", description = "Handle Stripe webhook events")
    public ResponseEntity<Void> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {
        
        try {
            // In a real implementation, you would verify the webhook signature
            // and parse the payload to extract payment intent information
            
            // For demo purposes, we'll just log the webhook
            logger.info("Received Stripe webhook: {}", payload);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            logger.error("Error processing Stripe webhook: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}
