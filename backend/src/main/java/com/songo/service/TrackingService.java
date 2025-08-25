package com.songo.service;

import com.songo.model.Shipment;
import com.songo.model.TrackingEvent;
import com.songo.model.User;
import com.songo.repository.ShipmentRepository;
import com.songo.repository.TrackingEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * Service class for tracking operations
 */
@Service
@Transactional
public class TrackingService {

    @Autowired
    private TrackingEventRepository trackingEventRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    private final Random random = new Random();

    public List<TrackingEvent> getTrackingHistory(String trackingNumber) {
        return trackingEventRepository.findByTrackingNumberOrderByEventDateDesc(trackingNumber);
    }

    public List<TrackingEvent> getShipmentTrackingHistory(Long shipmentId) {
        return trackingEventRepository.findByShipmentIdOrderByEventDateDesc(shipmentId);
    }

    public Optional<TrackingEvent> getLatestTrackingEvent(String trackingNumber) {
        return trackingEventRepository.findTopByTrackingNumberOrderByEventDateDesc(trackingNumber);
    }

    public Optional<TrackingEvent> getLatestTrackingEvent(Shipment shipment) {
        return trackingEventRepository.findTopByShipmentOrderByEventDateDesc(shipment);
    }

    public TrackingEvent addTrackingEvent(Shipment shipment, String eventType, String status, 
                                        String statusDescription, LocalDateTime eventDate) {
        TrackingEvent event = new TrackingEvent(shipment, eventType, status, eventDate);
        event.setStatusDescription(statusDescription);
        event.setTrackingNumber(shipment.getTrackingNumber());
        event.setCarrierName(shipment.getCarrier() != null ? shipment.getCarrier().getName() : "Unknown");
        
        return trackingEventRepository.save(event);
    }

    public TrackingEvent addTrackingEvent(TrackingEvent event) {
        return trackingEventRepository.save(event);
    }

    public List<TrackingEvent> getUserShipmentTracking(User user) {
        // Get all shipments for the user and their latest tracking events
        List<Shipment> userShipments = shipmentRepository.findByUserOrderByCreatedAtDesc(user);
        return userShipments.stream()
                .map(this::getLatestTrackingEvent)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
    }

    public boolean canUserAccessTracking(String trackingNumber, User user) {
        Optional<Shipment> shipment = shipmentRepository.findByTrackingNumber(trackingNumber);
        if (shipment.isPresent()) {
            return shipment.get().getUser().getId().equals(user.getId()) || user.isAdmin();
        }
        return false;
    }

    public void generateSampleTrackingEvents(Shipment shipment) {
        // Generate sample tracking events for demonstration
        LocalDateTime now = LocalDateTime.now();
        
        // Order created
        addTrackingEvent(shipment, "ORDER_CREATED", "PENDING", 
                        "Shipment order has been created", now.minusDays(3));
        
        // Picked up
        addTrackingEvent(shipment, "PICKUP", "IN_TRANSIT", 
                        "Package picked up from origin", now.minusDays(2));
        
        // In transit
        addTrackingEvent(shipment, "IN_TRANSIT", "IN_TRANSIT", 
                        "Package is in transit", now.minusDays(1));
        
        // Out for delivery (random chance)
        if (random.nextBoolean()) {
            addTrackingEvent(shipment, "OUT_FOR_DELIVERY", "OUT_FOR_DELIVERY", 
                            "Package is out for delivery", now.minusHours(4));
            
            // Delivered (random chance)
            if (random.nextBoolean()) {
                TrackingEvent deliveredEvent = addTrackingEvent(shipment, "DELIVERED", "DELIVERED", 
                                "Package has been delivered", now.minusHours(1));
                deliveredEvent.setActualDelivery(now.minusHours(1));
                deliveredEvent.setDeliverySignature("John Doe");
                trackingEventRepository.save(deliveredEvent);
                
                // Update shipment status
                shipment.setStatus(Shipment.ShipmentStatus.DELIVERED);
                shipmentRepository.save(shipment);
            }
        }
    }

    public void updateShipmentStatusFromTracking(Shipment shipment) {
        Optional<TrackingEvent> latestEvent = getLatestTrackingEvent(shipment);
        if (latestEvent.isPresent()) {
            TrackingEvent event = latestEvent.get();
            
            // Update shipment status based on latest tracking event
            switch (event.getStatus().toUpperCase()) {
                case "DELIVERED":
                    shipment.setStatus(Shipment.ShipmentStatus.DELIVERED);
                    if (event.getActualDelivery() != null) {
                        shipment.setDeliveredAt(event.getActualDelivery());
                    }
                    break;
                case "IN_TRANSIT":
                case "OUT_FOR_DELIVERY":
                    shipment.setStatus(Shipment.ShipmentStatus.IN_TRANSIT);
                    break;
                case "PENDING":
                    shipment.setStatus(Shipment.ShipmentStatus.PENDING);
                    break;
                case "EXCEPTION":
                    shipment.setStatus(Shipment.ShipmentStatus.EXCEPTION);
                    break;
                default:
                    // Keep current status
                    break;
            }
            
            shipmentRepository.save(shipment);
        }
    }

    public List<TrackingEvent> getDeliveredShipments() {
        return trackingEventRepository.findDeliveredShipments();
    }

    public List<TrackingEvent> getShipmentsWithExceptions() {
        return trackingEventRepository.findShipmentsWithExceptions();
    }

    public long getTrackingEventCount(Shipment shipment) {
        return trackingEventRepository.countByShipment(shipment);
    }

    // Public tracking (no authentication required)
    public List<TrackingEvent> getPublicTrackingHistory(String trackingNumber) {
        // For public access, we might want to limit the information returned
        List<TrackingEvent> events = trackingEventRepository.findByTrackingNumberOrderByEventDateDesc(trackingNumber);
        
        // Remove sensitive information for public access
        events.forEach(event -> {
            event.setDeliverySignature(null);
            event.setDeliveryInstructions(null);
        });
        
        return events;
    }

    public Optional<TrackingEvent> getPublicLatestTrackingEvent(String trackingNumber) {
        Optional<TrackingEvent> event = trackingEventRepository.findTopByTrackingNumberOrderByEventDateDesc(trackingNumber);
        
        // Remove sensitive information for public access
        event.ifPresent(e -> {
            e.setDeliverySignature(null);
            e.setDeliveryInstructions(null);
        });
        
        return event;
    }
}
