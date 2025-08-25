package com.songo.repository;

import com.songo.model.Shipment;
import com.songo.model.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for TrackingEvent entity
 */
@Repository
public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {
    
    List<TrackingEvent> findByShipmentOrderByEventDateDesc(Shipment shipment);
    
    List<TrackingEvent> findByTrackingNumberOrderByEventDateDesc(String trackingNumber);
    
    Optional<TrackingEvent> findTopByShipmentOrderByEventDateDesc(Shipment shipment);
    
    Optional<TrackingEvent> findTopByTrackingNumberOrderByEventDateDesc(String trackingNumber);
    
    List<TrackingEvent> findByShipmentAndEventType(Shipment shipment, String eventType);
    
    List<TrackingEvent> findByShipmentAndStatus(Shipment shipment, String status);
    
    @Query("SELECT te FROM TrackingEvent te WHERE te.shipment = :shipment AND te.eventDate BETWEEN :startDate AND :endDate ORDER BY te.eventDate DESC")
    List<TrackingEvent> findByShipmentAndEventDateBetween(@Param("shipment") Shipment shipment, 
                                                         @Param("startDate") LocalDateTime startDate, 
                                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT te FROM TrackingEvent te WHERE te.trackingNumber = :trackingNumber AND te.eventDate BETWEEN :startDate AND :endDate ORDER BY te.eventDate DESC")
    List<TrackingEvent> findByTrackingNumberAndEventDateBetween(@Param("trackingNumber") String trackingNumber, 
                                                               @Param("startDate") LocalDateTime startDate, 
                                                               @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT te FROM TrackingEvent te WHERE te.shipment.id = :shipmentId ORDER BY te.eventDate DESC")
    List<TrackingEvent> findByShipmentIdOrderByEventDateDesc(@Param("shipmentId") Long shipmentId);
    
    @Query("SELECT COUNT(te) FROM TrackingEvent te WHERE te.shipment = :shipment")
    long countByShipment(@Param("shipment") Shipment shipment);
    
    @Query("SELECT te FROM TrackingEvent te WHERE te.status = 'DELIVERED' AND te.actualDelivery IS NOT NULL ORDER BY te.actualDelivery DESC")
    List<TrackingEvent> findDeliveredShipments();
    
    @Query("SELECT te FROM TrackingEvent te WHERE te.exceptionCode IS NOT NULL AND te.exceptionCode != '' ORDER BY te.eventDate DESC")
    List<TrackingEvent> findShipmentsWithExceptions();
    
    boolean existsByShipmentAndEventTypeAndEventDate(Shipment shipment, String eventType, LocalDateTime eventDate);
}
