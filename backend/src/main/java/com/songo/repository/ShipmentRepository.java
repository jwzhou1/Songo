package com.songo.repository;

import com.songo.model.Carrier;
import com.songo.model.Shipment;
import com.songo.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Shipment entity
 */
@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    
    /**
     * Find shipment by shipment number
     */
    Optional<Shipment> findByShipmentNumber(String shipmentNumber);

    /**
     * Find shipments by status not in list
     */
    List<Shipment> findByStatusNotIn(List<Shipment.ShipmentStatus> statuses);

    /**
     * Count shipments by user ID
     */
    long countByUserId(Long userId);

    /**
     * Count shipments by user ID and status
     */
    long countByUserIdAndStatus(Long userId, Shipment.ShipmentStatus status);

    /**
     * Find shipments by user (for TrackingService compatibility)
     */
    List<Shipment> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find shipment by tracking number
     */
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    
    /**
     * Find shipments by user
     */
    List<Shipment> findByUser(User user);
    
    /**
     * Find shipments by user with pagination
     */
    Page<Shipment> findByUser(User user, Pageable pageable);
    
    /**
     * Find shipments by user ID
     */
    List<Shipment> findByUserId(Long userId);

    /**
     * Find shipments by user ID ordered by creation date
     */
    List<Shipment> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find shipments by user ID with pagination
     */
    Page<Shipment> findByUserId(Long userId, Pageable pageable);

    /**
     * Find shipments by user ID with pagination ordered by creation date
     */
    Page<Shipment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find shipments by status
     */
    List<Shipment> findByStatus(Shipment.ShipmentStatus status);
    
    /**
     * Find shipments by user and status
     */
    List<Shipment> findByUserAndStatus(User user, Shipment.ShipmentStatus status);
    
    /**
     * Find shipments by user ID and status
     */
    List<Shipment> findByUserIdAndStatus(Long userId, Shipment.ShipmentStatus status);

    /**
     * Find shipments by user ID and status ordered by creation date
     */
    List<Shipment> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Shipment.ShipmentStatus status);

    /**
     * Find shipments by user ID and status not in list
     */
    List<Shipment> findByUserIdAndStatusNotInOrderByCreatedAtDesc(Long userId, List<Shipment.ShipmentStatus> statuses);

    /**
     * Find shipment by tracking number and user ID
     */
    Optional<Shipment> findByTrackingNumberAndUserId(String trackingNumber, Long userId);
    
    /**
     * Find shipments by carrier
     */
    List<Shipment> findByCarrier(Carrier carrier);
    
    /**
     * Find shipments by shipment type
     */
    List<Shipment> findByShipmentType(Shipment.ShipmentType shipmentType);
    
    /**
     * Find shipments by pickup date
     */
    List<Shipment> findByPickupDate(LocalDate pickupDate);
    
    /**
     * Find shipments by pickup date range
     */
    List<Shipment> findByPickupDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find shipments created between dates
     */
    List<Shipment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find shipments by user created between dates
     */
    List<Shipment> findByUserAndCreatedAtBetween(User user, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find active shipments (not delivered or cancelled)
     */
    @Query("SELECT s FROM Shipment s WHERE s.status NOT IN ('DELIVERED', 'CANCELLED')")
    List<Shipment> findActiveShipments();
    
    /**
     * Find active shipments by user
     */
    @Query("SELECT s FROM Shipment s WHERE s.user = :user AND s.status NOT IN ('DELIVERED', 'CANCELLED')")
    List<Shipment> findActiveShipmentsByUser(@Param("user") User user);
    
    /**
     * Find shipments in transit
     */
    @Query("SELECT s FROM Shipment s WHERE s.status IN ('PICKED_UP', 'IN_TRANSIT')")
    List<Shipment> findInTransitShipments();
    
    /**
     * Find overdue shipments (past estimated delivery date)
     */
    @Query("SELECT s FROM Shipment s WHERE s.estimatedDelivery < :currentDate AND s.status NOT IN ('DELIVERED', 'CANCELLED')")
    List<Shipment> findOverdueShipments(@Param("currentDate") LocalDate currentDate);
    
    /**
     * Search shipments by multiple criteria
     */
    @Query("SELECT s FROM Shipment s WHERE " +
           "(:userId IS NULL OR s.user.id = :userId) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:carrierId IS NULL OR s.carrier.id = :carrierId) AND " +
           "(:shipmentType IS NULL OR s.shipmentType = :shipmentType) AND " +
           "(:startDate IS NULL OR s.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR s.createdAt <= :endDate)")
    Page<Shipment> searchShipments(@Param("userId") Long userId,
                                  @Param("status") Shipment.ShipmentStatus status,
                                  @Param("carrierId") Long carrierId,
                                  @Param("shipmentType") Shipment.ShipmentType shipmentType,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate,
                                  Pageable pageable);
    
    /**
     * Count shipments by user
     */
    long countByUser(User user);
    
    /**
     * Count shipments by user and status
     */
    long countByUserAndStatus(User user, Shipment.ShipmentStatus status);
    
    /**
     * Count shipments by status
     */
    long countByStatus(Shipment.ShipmentStatus status);
    
    /**
     * Count shipments by carrier
     */
    long countByCarrier(Carrier carrier);
    
    /**
     * Count shipments by shipment type
     */
    long countByShipmentType(Shipment.ShipmentType shipmentType);
    
    /**
     * Check if shipment number exists
     */
    boolean existsByShipmentNumber(String shipmentNumber);
    
    /**
     * Check if tracking number exists
     */
    boolean existsByTrackingNumber(String trackingNumber);
    
    /**
     * Find recent shipments by user (last 30 days)
     */
    @Query("SELECT s FROM Shipment s WHERE s.user = :user AND s.createdAt >= :cutoffDate ORDER BY s.createdAt DESC")
    List<Shipment> findRecentShipmentsByUser(@Param("user") User user, @Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Get shipment statistics by user
     */
    @Query("SELECT s.status, COUNT(s) FROM Shipment s WHERE s.user = :user GROUP BY s.status")
    List<Object[]> getShipmentStatsByUser(@Param("user") User user);

    /**
     * Search shipments by criteria (for ShippingHistoryService)
     */
    @Query("SELECT s FROM Shipment s WHERE " +
           "(:userId IS NULL OR s.user.id = :userId) AND " +
           "(:trackingNumber IS NULL OR s.trackingNumber LIKE %:trackingNumber%) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:fromDate IS NULL OR s.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR s.createdAt <= :toDate) " +
           "ORDER BY s.createdAt DESC")
    List<Shipment> searchShipments(@Param("userId") Long userId,
                                  @Param("trackingNumber") String trackingNumber,
                                  @Param("status") Shipment.ShipmentStatus status,
                                  @Param("fromDate") LocalDateTime fromDate,
                                  @Param("toDate") LocalDateTime toDate);

    /**
     * Find top N shipments by user ID ordered by creation date
     */
    @Query("SELECT s FROM Shipment s WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    List<Shipment> findTopNByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    default List<Shipment> findTopNByUserIdOrderByCreatedAtDesc(Long userId, int limit) {
        return findTopNByUserIdOrderByCreatedAtDesc(userId, Pageable.ofSize(limit));
    }

    /**
     * Search shipments by term (for ShipmentService)
     */
    @Query("SELECT s FROM Shipment s WHERE " +
           "LOWER(s.shipmentNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.carrierReference) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY s.createdAt DESC")
    List<Shipment> searchShipments(@Param("searchTerm") String searchTerm);
}
