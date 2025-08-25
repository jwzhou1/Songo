package com.songo.repository;

import com.songo.model.Carrier;
import com.songo.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Service entity
 */
@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    /**
     * Find services by carrier
     */
    List<Service> findByCarrier(Carrier carrier);
    
    /**
     * Find services by carrier ID
     */
    List<Service> findByCarrierId(Long carrierId);
    
    /**
     * Find service by carrier and code
     */
    Optional<Service> findByCarrierAndCode(Carrier carrier, String code);
    
    /**
     * Find service by carrier ID and code
     */
    Optional<Service> findByCarrierIdAndCode(Long carrierId, String code);
    
    /**
     * Find services by service type
     */
    List<Service> findByServiceType(Service.ServiceType serviceType);
    
    /**
     * Find active services
     */
    List<Service> findByIsActiveTrue();
    
    /**
     * Find inactive services
     */
    List<Service> findByIsActiveFalse();
    
    /**
     * Find active services by carrier
     */
    List<Service> findByCarrierAndIsActiveTrue(Carrier carrier);
    
    /**
     * Find active services by carrier ID
     */
    List<Service> findByCarrierIdAndIsActiveTrue(Long carrierId);
    
    /**
     * Find active services by service type
     */
    List<Service> findByServiceTypeAndIsActiveTrue(Service.ServiceType serviceType);
    
    /**
     * Find services by carrier and service type
     */
    List<Service> findByCarrierAndServiceType(Carrier carrier, Service.ServiceType serviceType);
    
    /**
     * Find active services by carrier and service type
     */
    List<Service> findByCarrierAndServiceTypeAndIsActiveTrue(Carrier carrier, Service.ServiceType serviceType);
    
    /**
     * Find services by name containing search term
     */
    @Query("SELECT s FROM Service s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Service> findByNameContaining(@Param("searchTerm") String searchTerm);
    
    /**
     * Find services with transit time within range
     */
    @Query("SELECT s FROM Service s WHERE " +
           "(:minTransitTime IS NULL OR s.transitTimeMin >= :minTransitTime) AND " +
           "(:maxTransitTime IS NULL OR s.transitTimeMax <= :maxTransitTime)")
    List<Service> findByTransitTimeRange(@Param("minTransitTime") Integer minTransitTime,
                                       @Param("maxTransitTime") Integer maxTransitTime);
    
    /**
     * Find services by multiple criteria
     */
    @Query("SELECT s FROM Service s WHERE " +
           "(:carrierId IS NULL OR s.carrier.id = :carrierId) AND " +
           "(:serviceType IS NULL OR s.serviceType = :serviceType) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive) AND " +
           "(:minTransitTime IS NULL OR s.transitTimeMin >= :minTransitTime) AND " +
           "(:maxTransitTime IS NULL OR s.transitTimeMax <= :maxTransitTime)")
    List<Service> searchServices(@Param("carrierId") Long carrierId,
                               @Param("serviceType") Service.ServiceType serviceType,
                               @Param("isActive") Boolean isActive,
                               @Param("minTransitTime") Integer minTransitTime,
                               @Param("maxTransitTime") Integer maxTransitTime);
    
    /**
     * Count services by carrier
     */
    long countByCarrier(Carrier carrier);
    
    /**
     * Count active services by carrier
     */
    long countByCarrierAndIsActiveTrue(Carrier carrier);
    
    /**
     * Count services by service type
     */
    long countByServiceType(Service.ServiceType serviceType);
    
    /**
     * Check if service exists by carrier and code
     */
    boolean existsByCarrierAndCode(Carrier carrier, String code);
}
