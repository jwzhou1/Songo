package com.songo.controller;

import com.songo.model.Quote;
import com.songo.model.Shipment;
import com.songo.model.User;
import com.songo.service.QuoteService;
import com.songo.service.ShipmentService;
import com.songo.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for dashboard operations and statistics
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private QuoteService quoteService;

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private TrackingService trackingService;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            Map<String, Object> stats = new HashMap<>();
            
            // Quote statistics
            Map<String, Object> quoteStats = new HashMap<>();
            quoteStats.put("total", quoteService.getUserQuoteCount(user));
            quoteStats.put("pending", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.PENDING));
            quoteStats.put("quoted", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.QUOTED));
            quoteStats.put("accepted", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.ACCEPTED));
            quoteStats.put("rejected", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.REJECTED));
            quoteStats.put("expired", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.EXPIRED));
            stats.put("quotes", quoteStats);
            
            // Shipment statistics
            Map<String, Object> shipmentStats = new HashMap<>();
            shipmentStats.put("total", shipmentService.getUserShipmentCount(user));
            shipmentStats.put("pending", shipmentService.getUserShipmentCountByStatus(user, Shipment.ShipmentStatus.PENDING));
            shipmentStats.put("inTransit", shipmentService.getUserShipmentCountByStatus(user, Shipment.ShipmentStatus.IN_TRANSIT));
            shipmentStats.put("delivered", shipmentService.getUserShipmentCountByStatus(user, Shipment.ShipmentStatus.DELIVERED));
            shipmentStats.put("cancelled", shipmentService.getUserShipmentCountByStatus(user, Shipment.ShipmentStatus.CANCELLED));
            shipmentStats.put("exception", shipmentService.getUserShipmentCountByStatus(user, Shipment.ShipmentStatus.EXCEPTION));
            stats.put("shipments", shipmentStats);
            
            // Recent activity
            List<Quote> recentQuotes = quoteService.getUserQuotes(user).stream().limit(5).toList();
            List<Shipment> recentShipments = shipmentService.getUserShipments(user).stream().limit(5).toList();
            
            stats.put("recentQuotes", recentQuotes);
            stats.put("recentShipments", recentShipments);
            
            // Financial summary (if available)
            Map<String, Object> financialStats = new HashMap<>();
            BigDecimal totalQuoteValue = recentQuotes.stream()
                    .filter(q -> q.getEstimatedPrice() != null)
                    .map(Quote::getEstimatedPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            financialStats.put("totalQuoteValue", totalQuoteValue);
            
            BigDecimal totalShipmentCost = recentShipments.stream()
                    .filter(s -> s.getTotalCost() != null)
                    .map(Shipment::getTotalCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            financialStats.put("totalShipmentCost", totalShipmentCost);
            
            stats.put("financial", financialStats);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch dashboard statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<?> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        try {
            User user = (User) authentication.getPrincipal();
            
            Map<String, Object> activity = new HashMap<>();
            
            // Recent quotes
            List<Quote> recentQuotes = quoteService.getUserQuotes(user).stream()
                    .limit(limit)
                    .toList();
            activity.put("recentQuotes", recentQuotes);
            
            // Recent shipments
            List<Shipment> recentShipments = shipmentService.getUserShipments(user).stream()
                    .limit(limit)
                    .toList();
            activity.put("recentShipments", recentShipments);
            
            // Recent tracking updates
            activity.put("recentTracking", trackingService.getUserShipmentTracking(user).stream()
                    .limit(limit)
                    .toList());
            
            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch recent activity: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            Map<String, Object> summary = new HashMap<>();
            
            // Quick counts
            summary.put("totalQuotes", quoteService.getUserQuoteCount(user));
            summary.put("totalShipments", shipmentService.getUserShipmentCount(user));
            summary.put("activeShipments", shipmentService.getUserShipmentCountByStatus(user, Shipment.ShipmentStatus.IN_TRANSIT));
            summary.put("pendingQuotes", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.PENDING));
            
            // User info
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("email", user.getEmail());
            userInfo.put("fullName", user.getFullName());
            userInfo.put("role", user.getRole().name());
            userInfo.put("lastLogin", user.getLastLogin());
            userInfo.put("memberSince", user.getCreatedAt());
            summary.put("user", userInfo);
            
            // System status
            Map<String, Object> systemStatus = new HashMap<>();
            systemStatus.put("timestamp", LocalDateTime.now());
            systemStatus.put("status", "operational");
            summary.put("system", systemStatus);
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch dashboard summary: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Admin dashboard endpoints
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getAdminDashboardStats(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            if (!user.isAdmin()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Admin access required");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            Map<String, Object> adminStats = new HashMap<>();
            
            // System-wide statistics would go here
            // For now, return basic info
            adminStats.put("message", "Admin dashboard statistics");
            adminStats.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(adminStats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch admin dashboard statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
