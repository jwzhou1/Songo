package com.songo.controller;

import com.songo.model.TrackingEvent;
import com.songo.model.User;
import com.songo.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for tracking operations
 */
@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TrackingController {

    @Autowired
    private TrackingService trackingService;

    @GetMapping("/{trackingNumber}")
    public ResponseEntity<?> getTrackingHistory(@PathVariable String trackingNumber, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            // Check if user can access this tracking information
            if (!trackingService.canUserAccessTracking(trackingNumber, user)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized to access this tracking information");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<TrackingEvent> trackingHistory = trackingService.getTrackingHistory(trackingNumber);
            
            if (trackingHistory.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No tracking information found for tracking number: " + trackingNumber);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            return ResponseEntity.ok(trackingHistory);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch tracking information: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{trackingNumber}/latest")
    public ResponseEntity<?> getLatestTrackingEvent(@PathVariable String trackingNumber, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            // Check if user can access this tracking information
            if (!trackingService.canUserAccessTracking(trackingNumber, user)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized to access this tracking information");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            Optional<TrackingEvent> latestEvent = trackingService.getLatestTrackingEvent(trackingNumber);
            
            if (latestEvent.isPresent()) {
                return ResponseEntity.ok(latestEvent.get());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No tracking information found for tracking number: " + trackingNumber);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch latest tracking information: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<?> getShipmentTrackingHistory(@PathVariable Long shipmentId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            List<TrackingEvent> trackingHistory = trackingService.getShipmentTrackingHistory(shipmentId);
            
            if (trackingHistory.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No tracking information found for shipment ID: " + shipmentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Check if user owns the shipment or is admin
            TrackingEvent firstEvent = trackingHistory.get(0);
            if (!firstEvent.getShipment().getUser().getId().equals(user.getId()) && !user.isAdmin()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized to access this tracking information");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            return ResponseEntity.ok(trackingHistory);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch shipment tracking information: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/my-shipments")
    public ResponseEntity<?> getUserShipmentTracking(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<TrackingEvent> userTracking = trackingService.getUserShipmentTracking(user);
            return ResponseEntity.ok(userTracking);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch user shipment tracking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Public tracking endpoints (no authentication required)
    @GetMapping("/public/{trackingNumber}")
    public ResponseEntity<?> getPublicTrackingHistory(@PathVariable String trackingNumber) {
        try {
            List<TrackingEvent> trackingHistory = trackingService.getPublicTrackingHistory(trackingNumber);
            
            if (trackingHistory.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No tracking information found for tracking number: " + trackingNumber);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            return ResponseEntity.ok(trackingHistory);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch tracking information: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/public/{trackingNumber}/latest")
    public ResponseEntity<?> getPublicLatestTrackingEvent(@PathVariable String trackingNumber) {
        try {
            Optional<TrackingEvent> latestEvent = trackingService.getPublicLatestTrackingEvent(trackingNumber);
            
            if (latestEvent.isPresent()) {
                return ResponseEntity.ok(latestEvent.get());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No tracking information found for tracking number: " + trackingNumber);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch latest tracking information: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Admin endpoints
    @GetMapping("/admin/delivered")
    public ResponseEntity<?> getDeliveredShipments(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            if (!user.isAdmin()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Admin access required");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<TrackingEvent> deliveredShipments = trackingService.getDeliveredShipments();
            return ResponseEntity.ok(deliveredShipments);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch delivered shipments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/admin/exceptions")
    public ResponseEntity<?> getShipmentsWithExceptions(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            if (!user.isAdmin()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Admin access required");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<TrackingEvent> exceptionsShipments = trackingService.getShipmentsWithExceptions();
            return ResponseEntity.ok(exceptionsShipments);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch shipments with exceptions: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
