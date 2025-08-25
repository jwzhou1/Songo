package com.songo.repository;

import com.songo.model.Carrier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Carrier entity
 */
@Repository
public interface CarrierRepository extends JpaRepository<Carrier, Long> {
    
    /**
     * Find carrier by code
     */
    Optional<Carrier> findByCode(String code);
    
    /**
     * Find carrier by name
     */
    Optional<Carrier> findByName(String name);
    
    /**
     * Check if carrier exists by code
     */
    boolean existsByCode(String code);
    
    /**
     * Check if carrier exists by name
     */
    boolean existsByName(String name);
    
    /**
     * Find active carriers
     */
    List<Carrier> findByIsActiveTrue();
    
    /**
     * Find inactive carriers
     */
    List<Carrier> findByIsActiveFalse();
    
    /**
     * Find carriers that support parcel shipping
     */
    List<Carrier> findBySupportsParcelTrue();
    
    /**
     * Find carriers that support LTL shipping
     */
    List<Carrier> findBySupportsLtlTrue();
    
    /**
     * Find carriers that support tracking
     */
    List<Carrier> findBySupportsTrackingTrue();
    
    /**
     * Find active carriers that support parcel shipping
     */
    List<Carrier> findByIsActiveTrueAndSupportsParcelTrue();
    
    /**
     * Find active carriers that support LTL shipping
     */
    List<Carrier> findByIsActiveTrueAndSupportsLtlTrue();
    
    /**
     * Find carriers by name containing search term
     */
    @Query("SELECT c FROM Carrier c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Carrier> findByNameContaining(@Param("searchTerm") String searchTerm);
    
    /**
     * Find carriers by multiple criteria
     */
    @Query("SELECT c FROM Carrier c WHERE " +
           "(:isActive IS NULL OR c.isActive = :isActive) AND " +
           "(:supportsParcel IS NULL OR c.supportsParcel = :supportsParcel) AND " +
           "(:supportsLtl IS NULL OR c.supportsLtl = :supportsLtl) AND " +
           "(:supportsTracking IS NULL OR c.supportsTracking = :supportsTracking)")
    List<Carrier> findByCapabilities(@Param("isActive") Boolean isActive,
                                   @Param("supportsParcel") Boolean supportsParcel,
                                   @Param("supportsLtl") Boolean supportsLtl,
                                   @Param("supportsTracking") Boolean supportsTracking);
    
    /**
     * Count active carriers
     */
    long countByIsActiveTrue();
    
    /**
     * Count carriers by support type
     */
    long countBySupportsParcelTrue();
    long countBySupportsLtlTrue();
    long countBySupportsTrackingTrue();
}
