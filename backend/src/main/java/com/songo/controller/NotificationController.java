package com.songo.controller;

import com.songo.model.User;
import com.songo.service.NotificationService;
import com.songo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * REST Controller for real-time notifications
 */
@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Real-time notification operations")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class NotificationController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    
    private final NotificationService notificationService;
    private final UserService userService;
    
    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }
    
    /**
     * Create SSE connection for real-time notifications
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Connect to notification stream", description = "Establish SSE connection for real-time notifications")
    public SseEmitter streamNotifications(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            logger.info("Creating SSE connection for user: {}", user.getEmail());
            
            SseEmitter emitter = notificationService.createConnection(user.getId());
            
            // Start periodic notifications for demo
            notificationService.schedulePeriodicNotifications(user);
            
            return emitter;
            
        } catch (Exception e) {
            logger.error("Error creating SSE connection: {}", e.getMessage(), e);
            SseEmitter emitter = new SseEmitter();
            try {
                emitter.completeWithError(e);
            } catch (Exception ex) {
                logger.error("Error completing emitter with error: {}", ex.getMessage());
            }
            return emitter;
        }
    }
    
    /**
     * Send test notification (for demo purposes)
     */
    @PostMapping("/test")
    @Operation(summary = "Send test notification", description = "Send a test notification to the current user")
    public ResponseEntity<String> sendTestNotification(
            @RequestParam(defaultValue = "Test Notification") String title,
            @RequestParam(defaultValue = "This is a test notification from SonGo") String message,
            Authentication authentication) {
        
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            notificationService.sendRealTimeNotification(
                user.getId(),
                "test",
                title,
                message,
                java.util.Map.of("testData", "This is test data", "timestamp", java.time.LocalDateTime.now())
            );
            
            return ResponseEntity.ok("Test notification sent successfully");
            
        } catch (Exception e) {
            logger.error("Error sending test notification: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error sending test notification: " + e.getMessage());
        }
    }
    
    /**
     * Simulate quote ready notification
     */
    @PostMapping("/simulate/quote-ready")
    @Operation(summary = "Simulate quote ready notification", description = "Simulate a quote ready notification for testing")
    public ResponseEntity<String> simulateQuoteReady(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            notificationService.sendRealTimeNotification(
                user.getId(),
                "quote",
                "Quote Ready",
                "Your shipping quote QT" + System.currentTimeMillis() + " is ready for review",
                java.util.Map.of(
                    "quoteNumber", "QT" + System.currentTimeMillis(),
                    "estimatedPrice", 125.50,
                    "validUntil", java.time.LocalDateTime.now().plusDays(7)
                )
            );
            
            return ResponseEntity.ok("Quote ready notification sent");
            
        } catch (Exception e) {
            logger.error("Error simulating quote ready notification: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Simulate shipment status update notification
     */
    @PostMapping("/simulate/shipment-update")
    @Operation(summary = "Simulate shipment update notification", description = "Simulate a shipment status update notification")
    public ResponseEntity<String> simulateShipmentUpdate(
            @RequestParam(defaultValue = "IN_TRANSIT") String status,
            Authentication authentication) {
        
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            String trackingNumber = "SG" + System.currentTimeMillis();
            
            notificationService.sendRealTimeNotification(
                user.getId(),
                "shipment",
                "Shipment Update",
                "Your shipment " + trackingNumber + " status changed to " + status,
                java.util.Map.of(
                    "trackingNumber", trackingNumber,
                    "status", status,
                    "location", "Distribution Center - Chicago, IL",
                    "timestamp", java.time.LocalDateTime.now()
                )
            );
            
            return ResponseEntity.ok("Shipment update notification sent");
            
        } catch (Exception e) {
            logger.error("Error simulating shipment update notification: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Simulate payment confirmation notification
     */
    @PostMapping("/simulate/payment-confirmation")
    @Operation(summary = "Simulate payment confirmation", description = "Simulate a payment confirmation notification")
    public ResponseEntity<String> simulatePaymentConfirmation(
            @RequestParam(defaultValue = "125.50") Double amount,
            Authentication authentication) {
        
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            String paymentNumber = "PAY" + System.currentTimeMillis();
            
            notificationService.notifyPaymentConfirmation(user, paymentNumber, amount);
            
            return ResponseEntity.ok("Payment confirmation notification sent");
            
        } catch (Exception e) {
            logger.error("Error simulating payment confirmation: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Simulate delivery notification
     */
    @PostMapping("/simulate/delivery")
    @Operation(summary = "Simulate delivery notification", description = "Simulate a package delivery notification")
    public ResponseEntity<String> simulateDelivery(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            String trackingNumber = "SG" + System.currentTimeMillis();
            
            notificationService.sendRealTimeNotification(
                user.getId(),
                "delivery",
                "Package Delivered",
                "Your package " + trackingNumber + " has been delivered successfully",
                java.util.Map.of(
                    "trackingNumber", trackingNumber,
                    "deliveredAt", java.time.LocalDateTime.now(),
                    "location", "Front Door",
                    "signature", "Left at door per customer request"
                )
            );
            
            return ResponseEntity.ok("Delivery notification sent");
            
        } catch (Exception e) {
            logger.error("Error simulating delivery notification: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
