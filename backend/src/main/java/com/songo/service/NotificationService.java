package com.songo.service;

import com.songo.model.User;
import com.songo.model.Shipment;
import com.songo.model.Quote;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Service for handling real-time notifications
 */
@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    private final JavaMailSender mailSender;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(5);
    
    // Store SSE connections for real-time notifications
    private final Map<Long, SseEmitter> userConnections = new ConcurrentHashMap<>();
    
    @Value("${spring.mail.username:noreply@songo-enterprise.com}")
    private String fromEmail;
    
    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    /**
     * Create SSE connection for real-time notifications
     */
    public SseEmitter createConnection(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        emitter.onCompletion(() -> userConnections.remove(userId));
        emitter.onTimeout(() -> userConnections.remove(userId));
        emitter.onError((ex) -> {
            logger.error("SSE error for user {}: {}", userId, ex.getMessage());
            userConnections.remove(userId);
        });
        
        userConnections.put(userId, emitter);
        
        // Send initial connection confirmation
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("Connected to SonGo notifications"));
        } catch (IOException e) {
            logger.error("Error sending initial SSE message: {}", e.getMessage());
        }
        
        return emitter;
    }
    
    /**
     * Send real-time notification to user
     */
    public void sendRealTimeNotification(Long userId, String type, String title, String message, Object data) {
        SseEmitter emitter = userConnections.get(userId);
        if (emitter != null) {
            try {
                NotificationData notification = new NotificationData(type, title, message, data, LocalDateTime.now());
                emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(notification));
            } catch (IOException e) {
                logger.error("Error sending SSE notification to user {}: {}", userId, e.getMessage());
                userConnections.remove(userId);
            }
        }
    }
    
    /**
     * Send quote ready notification
     */
    public void notifyQuoteReady(User user, Quote quote) {
        // Real-time notification
        sendRealTimeNotification(
            user.getId(),
            "quote",
            "Quote Ready",
            "Your shipping quote " + quote.getQuoteNumber() + " is ready for review",
            Map.of(
                "quoteId", quote.getId(),
                "quoteNumber", quote.getQuoteNumber(),
                "estimatedPrice", quote.getEstimatedPrice()
            )
        );
        
        // Email notification
        sendQuoteReadyEmail(user, quote);
    }
    
    /**
     * Send shipment status update notification
     */
    public void notifyShipmentStatusUpdate(User user, Shipment shipment, String oldStatus, String newStatus) {
        // Real-time notification
        sendRealTimeNotification(
            user.getId(),
            "shipment",
            "Shipment Update",
            "Your shipment " + shipment.getShipmentNumber() + " status changed to " + newStatus,
            Map.of(
                "shipmentId", shipment.getId(),
                "shipmentNumber", shipment.getShipmentNumber(),
                "oldStatus", oldStatus,
                "newStatus", newStatus
            )
        );
        
        // Email notification
        sendShipmentStatusEmail(user, shipment, newStatus);
    }
    
    /**
     * Send payment confirmation notification
     */
    public void notifyPaymentConfirmation(User user, String paymentNumber, Double amount) {
        // Real-time notification
        sendRealTimeNotification(
            user.getId(),
            "payment",
            "Payment Confirmed",
            "Your payment of $" + String.format("%.2f", amount) + " has been processed successfully",
            Map.of(
                "paymentNumber", paymentNumber,
                "amount", amount
            )
        );
        
        // Email notification
        sendPaymentConfirmationEmail(user, paymentNumber, amount);
    }
    
    /**
     * Send delivery notification
     */
    public void notifyDelivery(User user, Shipment shipment) {
        // Real-time notification
        sendRealTimeNotification(
            user.getId(),
            "delivery",
            "Package Delivered",
            "Your package " + shipment.getShipmentNumber() + " has been delivered successfully",
            Map.of(
                "shipmentId", shipment.getId(),
                "shipmentNumber", shipment.getShipmentNumber(),
                "deliveredAt", LocalDateTime.now()
            )
        );
        
        // Email notification
        sendDeliveryEmail(user, shipment);
    }
    
    /**
     * Send quote ready email
     */
    private void sendQuoteReadyEmail(User user, Quote quote) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Your SonGo Quote is Ready - " + quote.getQuoteNumber());
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Your shipping quote %s is now ready for review.\n\n" +
                "Quote Details:\n" +
                "- From: %s, %s\n" +
                "- To: %s, %s\n" +
                "- Estimated Price: $%.2f\n" +
                "- Valid Until: %s\n\n" +
                "You can review and book your shipment by logging into your SonGo dashboard.\n\n" +
                "Best regards,\n" +
                "The SonGo Team",
                user.getFirstName(),
                quote.getQuoteNumber(),
                quote.getOriginCity(), quote.getOriginState(),
                quote.getDestinationCity(), quote.getDestinationState(),
                quote.getEstimatedPrice(),
                quote.getValidUntil()
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            logger.info("Quote ready email sent to user: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("Error sending quote ready email to user {}: {}", user.getEmail(), e.getMessage());
        }
    }
    
    /**
     * Send shipment status email
     */
    private void sendShipmentStatusEmail(User user, Shipment shipment, String newStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Shipment Update - " + shipment.getShipmentNumber());
            
            String statusMessage = getStatusMessage(newStatus);
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Your shipment %s has been updated.\n\n" +
                "Current Status: %s\n" +
                "%s\n\n" +
                "You can track your shipment in real-time by visiting your SonGo dashboard.\n\n" +
                "Best regards,\n" +
                "The SonGo Team",
                user.getFirstName(),
                shipment.getShipmentNumber(),
                newStatus,
                statusMessage
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            logger.info("Shipment status email sent to user: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("Error sending shipment status email to user {}: {}", user.getEmail(), e.getMessage());
        }
    }
    
    /**
     * Send payment confirmation email
     */
    private void sendPaymentConfirmationEmail(User user, String paymentNumber, Double amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Payment Confirmation - " + paymentNumber);
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Your payment has been processed successfully.\n\n" +
                "Payment Details:\n" +
                "- Payment Number: %s\n" +
                "- Amount: $%.2f\n" +
                "- Date: %s\n\n" +
                "Thank you for choosing SonGo for your shipping needs.\n\n" +
                "Best regards,\n" +
                "The SonGo Team",
                user.getFirstName(),
                paymentNumber,
                amount,
                LocalDateTime.now()
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            logger.info("Payment confirmation email sent to user: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("Error sending payment confirmation email to user {}: {}", user.getEmail(), e.getMessage());
        }
    }
    
    /**
     * Send delivery email
     */
    private void sendDeliveryEmail(User user, Shipment shipment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Package Delivered - " + shipment.getShipmentNumber());
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Great news! Your package has been delivered successfully.\n\n" +
                "Shipment Details:\n" +
                "- Tracking Number: %s\n" +
                "- Delivered At: %s\n\n" +
                "Thank you for choosing SonGo for your shipping needs. We hope to serve you again soon!\n\n" +
                "Best regards,\n" +
                "The SonGo Team",
                user.getFirstName(),
                shipment.getShipmentNumber(),
                LocalDateTime.now()
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            logger.info("Delivery email sent to user: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("Error sending delivery email to user {}: {}", user.getEmail(), e.getMessage());
        }
    }
    
    /**
     * Get user-friendly status message
     */
    private String getStatusMessage(String status) {
        return switch (status.toUpperCase()) {
            case "PICKED_UP" -> "Your package has been picked up and is on its way to the sorting facility.";
            case "IN_TRANSIT" -> "Your package is in transit and moving towards its destination.";
            case "OUT_FOR_DELIVERY" -> "Your package is out for delivery and will arrive today.";
            case "DELIVERED" -> "Your package has been delivered successfully.";
            case "EXCEPTION" -> "There was an exception with your shipment. Please contact customer service.";
            default -> "Your shipment status has been updated.";
        };
    }
    
    /**
     * Schedule periodic notifications (for demo purposes)
     */
    public void schedulePeriodicNotifications(User user) {
        scheduler.scheduleAtFixedRate(() -> {
            sendRealTimeNotification(
                user.getId(),
                "system",
                "System Update",
                "Your dashboard has been updated with the latest information",
                Map.of("timestamp", LocalDateTime.now())
            );
        }, 30, 60, TimeUnit.SECONDS); // Send every minute after 30 seconds delay
    }
    
    /**
     * Notification data structure
     */
    public static class NotificationData {
        private String type;
        private String title;
        private String message;
        private Object data;
        private LocalDateTime timestamp;
        
        public NotificationData(String type, String title, String message, Object data, LocalDateTime timestamp) {
            this.type = type;
            this.title = title;
            this.message = message;
            this.data = data;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}
