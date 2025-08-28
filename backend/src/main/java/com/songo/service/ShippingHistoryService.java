package com.songo.service;

import com.songo.model.Shipment;
import com.songo.model.User;
import com.songo.model.Invoice;
import com.songo.repository.ShipmentRepository;
import com.songo.repository.UserRepository;
import com.songo.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing customer shipping history and related operations
 */
@Service
@Transactional
public class ShippingHistoryService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    /**
     * Get all shipments for a user with pagination
     */
    public Page<Shipment> getUserShipments(Long userId, Pageable pageable) {
        return shipmentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * Get all shipments for a user
     */
    public List<Shipment> getUserShipments(Long userId) {
        return shipmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get shipments by status for a user
     */
    public List<Shipment> getUserShipmentsByStatus(Long userId, Shipment.ShipmentStatus status) {
        return shipmentRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
    }

    /**
     * Get active shipments for a user (not delivered or cancelled)
     */
    public List<Shipment> getUserActiveShipments(Long userId) {
        return shipmentRepository.findByUserIdAndStatusNotInOrderByCreatedAtDesc(
            userId, 
            List.of(Shipment.ShipmentStatus.DELIVERED, Shipment.ShipmentStatus.CANCELLED)
        );
    }

    /**
     * Get shipment by tracking number and user
     */
    public Optional<Shipment> getShipmentByTrackingNumber(String trackingNumber, Long userId) {
        return shipmentRepository.findByTrackingNumberAndUserId(trackingNumber, userId);
    }

    /**
     * Create a new shipment
     */
    public Shipment createShipment(Shipment shipment, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        shipment.setUser(user);
        shipment.setStatus(Shipment.ShipmentStatus.PENDING);
        shipment.setCreatedAt(LocalDateTime.now());
        
        // Generate tracking number if not provided
        if (shipment.getTrackingNumber() == null || shipment.getTrackingNumber().isEmpty()) {
            shipment.setTrackingNumber(generateTrackingNumber());
        }

        return shipmentRepository.save(shipment);
    }

    /**
     * Update shipment status
     */
    public Shipment updateShipmentStatus(Long shipmentId, Shipment.ShipmentStatus status, String statusNote) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new RuntimeException("Shipment not found"));

        shipment.setStatus(status);
        if (statusNote != null && !statusNote.trim().isEmpty()) {
            shipment.setNotes(statusNote);
        }
        shipment.setUpdatedAt(LocalDateTime.now());

        // Set delivery date if delivered
        if (status == Shipment.ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }

        return shipmentRepository.save(shipment);
    }

    /**
     * Cancel shipment
     */
    public Shipment cancelShipment(Long shipmentId, Long userId, String reason) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (!shipment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Shipment does not belong to user");
        }

        if (shipment.getStatus() == Shipment.ShipmentStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel delivered shipment");
        }

        shipment.setStatus(Shipment.ShipmentStatus.CANCELLED);
        shipment.setNotes(reason);
        shipment.setUpdatedAt(LocalDateTime.now());

        return shipmentRepository.save(shipment);
    }

    /**
     * Get shipping statistics for a user
     */
    public ShippingStats getUserShippingStats(Long userId) {
        List<Shipment> allShipments = getUserShipments(userId);
        
        ShippingStats stats = new ShippingStats();
        stats.setTotalShipments(allShipments.size());
        stats.setActiveShipments((int) allShipments.stream()
            .filter(s -> s.getStatus() != Shipment.ShipmentStatus.DELIVERED && 
                        s.getStatus() != Shipment.ShipmentStatus.CANCELLED)
            .count());
        stats.setDeliveredShipments((int) allShipments.stream()
            .filter(s -> s.getStatus() == Shipment.ShipmentStatus.DELIVERED)
            .count());
        stats.setCancelledShipments((int) allShipments.stream()
            .filter(s -> s.getStatus() == Shipment.ShipmentStatus.CANCELLED)
            .count());
        
        // Calculate total spent
        BigDecimal totalSpent = allShipments.stream()
            .filter(s -> s.getTotalCost() != null)
            .map(Shipment::getTotalCost)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalSpent(totalSpent);

        return stats;
    }

    /**
     * Search shipments by various criteria
     */
    public List<Shipment> searchUserShipments(Long userId, String trackingNumber, 
                                            Shipment.ShipmentStatus status, 
                                            LocalDateTime fromDate, 
                                            LocalDateTime toDate) {
        return shipmentRepository.searchShipments(userId, trackingNumber, status, fromDate, toDate);
    }

    /**
     * Get recent shipments for a user
     */
    public List<Shipment> getRecentShipments(Long userId, int limit) {
        return shipmentRepository.findTopNByUserIdOrderByCreatedAtDesc(userId, limit);
    }

    /**
     * Generate a unique tracking number
     */
    private String generateTrackingNumber() {
        String prefix = "SG";
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 1000);
        return prefix + timestamp + String.format("%03d", random);
    }

    /**
     * Inner class for shipping statistics
     */
    public static class ShippingStats {
        private int totalShipments;
        private int activeShipments;
        private int deliveredShipments;
        private int cancelledShipments;
        private BigDecimal totalSpent;

        // Getters and setters
        public int getTotalShipments() { return totalShipments; }
        public void setTotalShipments(int totalShipments) { this.totalShipments = totalShipments; }

        public int getActiveShipments() { return activeShipments; }
        public void setActiveShipments(int activeShipments) { this.activeShipments = activeShipments; }

        public int getDeliveredShipments() { return deliveredShipments; }
        public void setDeliveredShipments(int deliveredShipments) { this.deliveredShipments = deliveredShipments; }

        public int getCancelledShipments() { return cancelledShipments; }
        public void setCancelledShipments(int cancelledShipments) { this.cancelledShipments = cancelledShipments; }

        public BigDecimal getTotalSpent() { return totalSpent; }
        public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
    }
}
