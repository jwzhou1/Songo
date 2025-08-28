package com.songo.service;

import com.songo.model.*;
import com.songo.repository.*;
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
 * Service for managing shipments
 */
@Service
@Transactional
public class ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarrierRepository carrierRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private AddressRepository addressRepository;

    /**
     * Create a new shipment
     */
    public Shipment createShipment(Shipment shipment) {
        // Generate shipment number if not provided
        if (shipment.getShipmentNumber() == null || shipment.getShipmentNumber().isEmpty()) {
            shipment.setShipmentNumber(generateShipmentNumber());
        }

        // Set default status
        if (shipment.getStatus() == null) {
            shipment.setStatus(Shipment.ShipmentStatus.DRAFT);
        }

        // Set timestamps
        shipment.setCreatedAt(LocalDateTime.now());
        shipment.setUpdatedAt(LocalDateTime.now());

        return shipmentRepository.save(shipment);
    }

    /**
     * Get shipment by ID
     */
    public Optional<Shipment> getShipmentById(Long id) {
        return shipmentRepository.findById(id);
    }

    /**
     * Get shipment by shipment number
     */
    public Optional<Shipment> getShipmentByNumber(String shipmentNumber) {
        return shipmentRepository.findByShipmentNumber(shipmentNumber);
    }

    /**
     * Get shipments by user
     */
    public List<Shipment> getShipmentsByUser(Long userId) {
        return shipmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get shipments by user (User object)
     */
    public List<Shipment> getUserShipments(User user) {
        return shipmentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    /**
     * Get shipment count by user
     */
    public long getUserShipmentCount(User user) {
        return shipmentRepository.countByUserId(user.getId());
    }

    /**
     * Get shipment count by user and status
     */
    public long getUserShipmentCountByStatus(User user, Shipment.ShipmentStatus status) {
        return shipmentRepository.countByUserIdAndStatus(user.getId(), status);
    }

    /**
     * Get shipments by user with pagination
     */
    public Page<Shipment> getShipmentsByUser(Long userId, Pageable pageable) {
        return shipmentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * Get shipments by status
     */
    public List<Shipment> getShipmentsByStatus(Shipment.ShipmentStatus status) {
        return shipmentRepository.findByStatus(status);
    }

    /**
     * Update shipment
     */
    public Shipment updateShipment(Shipment shipment) {
        shipment.setUpdatedAt(LocalDateTime.now());
        return shipmentRepository.save(shipment);
    }

    /**
     * Update shipment status
     */
    public Shipment updateShipmentStatus(Long shipmentId, Shipment.ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new RuntimeException("Shipment not found"));

        shipment.setStatus(status);
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
    public Shipment cancelShipment(Long shipmentId, String reason) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (!shipment.canBeCancelled()) {
            throw new RuntimeException("Shipment cannot be cancelled in current status: " + shipment.getStatus());
        }

        shipment.setStatus(Shipment.ShipmentStatus.CANCELLED);
        shipment.setNotes(reason);
        shipment.setUpdatedAt(LocalDateTime.now());

        return shipmentRepository.save(shipment);
    }

    /**
     * Delete shipment
     */
    public void deleteShipment(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (shipment.getStatus() != Shipment.ShipmentStatus.DRAFT) {
            throw new RuntimeException("Only draft shipments can be deleted");
        }

        shipmentRepository.delete(shipment);
    }

    /**
     * Get shipments by tracking number
     */
    public Optional<Shipment> getShipmentByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber);
    }

    /**
     * Search shipments
     */
    public List<Shipment> searchShipments(String searchTerm) {
        return shipmentRepository.searchShipments(searchTerm);
    }

    /**
     * Get active shipments (not delivered or cancelled)
     */
    public List<Shipment> getActiveShipments() {
        return shipmentRepository.findByStatusNotIn(
            List.of(Shipment.ShipmentStatus.DELIVERED, Shipment.ShipmentStatus.CANCELLED)
        );
    }

    /**
     * Calculate shipment cost
     */
    public BigDecimal calculateShipmentCost(Shipment shipment) {
        // This is a simplified calculation
        // In a real system, this would integrate with carrier APIs
        
        BigDecimal baseCost = BigDecimal.valueOf(10.00); // Base cost
        BigDecimal weightCost = shipment.getTotalWeight().multiply(BigDecimal.valueOf(0.50)); // $0.50 per unit weight
        BigDecimal fuelSurcharge = baseCost.multiply(BigDecimal.valueOf(0.15)); // 15% fuel surcharge
        BigDecimal taxes = baseCost.add(weightCost).add(fuelSurcharge).multiply(BigDecimal.valueOf(0.13)); // 13% tax

        BigDecimal totalCost = baseCost.add(weightCost).add(fuelSurcharge).add(taxes);

        // Update shipment with calculated costs
        shipment.setBaseCost(baseCost);
        shipment.setFuelSurcharge(fuelSurcharge);
        shipment.setTaxes(taxes);
        shipment.setTotalCost(totalCost);

        return totalCost;
    }

    /**
     * Generate unique shipment number
     */
    private String generateShipmentNumber() {
        String prefix = "SH";
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 1000);
        return prefix + timestamp + String.format("%03d", random);
    }

    /**
     * Get shipment statistics
     */
    public ShipmentStats getShipmentStats() {
        List<Shipment> allShipments = shipmentRepository.findAll();
        
        ShipmentStats stats = new ShipmentStats();
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

        return stats;
    }

    /**
     * Inner class for shipment statistics
     */
    public static class ShipmentStats {
        private int totalShipments;
        private int activeShipments;
        private int deliveredShipments;
        private int cancelledShipments;

        // Getters and setters
        public int getTotalShipments() { return totalShipments; }
        public void setTotalShipments(int totalShipments) { this.totalShipments = totalShipments; }

        public int getActiveShipments() { return activeShipments; }
        public void setActiveShipments(int activeShipments) { this.activeShipments = activeShipments; }

        public int getDeliveredShipments() { return deliveredShipments; }
        public void setDeliveredShipments(int deliveredShipments) { this.deliveredShipments = deliveredShipments; }

        public int getCancelledShipments() { return cancelledShipments; }
        public void setCancelledShipments(int cancelledShipments) { this.cancelledShipments = cancelledShipments; }
    }
}
