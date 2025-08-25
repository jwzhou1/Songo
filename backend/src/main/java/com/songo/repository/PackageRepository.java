package com.songo.repository;

import com.songo.model.Package;
import com.songo.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for Package entity
 */
@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    
    /**
     * Find packages by shipment
     */
    List<Package> findByShipment(Shipment shipment);
    
    /**
     * Find packages by shipment ID
     */
    List<Package> findByShipmentId(Long shipmentId);
    
    /**
     * Find packages by package type
     */
    List<Package> findByPackageType(Package.PackageType packageType);
    
    /**
     * Find packages by shipment and package type
     */
    List<Package> findByShipmentAndPackageType(Shipment shipment, Package.PackageType packageType);
    
    /**
     * Find packages with weight greater than specified value
     */
    List<Package> findByWeightGreaterThan(BigDecimal weight);
    
    /**
     * Find packages with weight less than specified value
     */
    List<Package> findByWeightLessThan(BigDecimal weight);
    
    /**
     * Find packages with weight between specified values
     */
    List<Package> findByWeightBetween(BigDecimal minWeight, BigDecimal maxWeight);
    
    /**
     * Find packages with declared value greater than specified amount
     */
    List<Package> findByDeclaredValueGreaterThan(BigDecimal value);
    
    /**
     * Find packages by description containing search term
     */
    @Query("SELECT p FROM Package p WHERE LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Package> findByDescriptionContaining(@Param("searchTerm") String searchTerm);
    
    /**
     * Calculate total weight for a shipment
     */
    @Query("SELECT SUM(p.weight) FROM Package p WHERE p.shipment = :shipment")
    BigDecimal calculateTotalWeightByShipment(@Param("shipment") Shipment shipment);
    
    /**
     * Calculate total declared value for a shipment
     */
    @Query("SELECT SUM(p.declaredValue) FROM Package p WHERE p.shipment = :shipment AND p.declaredValue IS NOT NULL")
    BigDecimal calculateTotalValueByShipment(@Param("shipment") Shipment shipment);
    
    /**
     * Calculate total volume for a shipment
     */
    @Query("SELECT SUM(p.length * p.width * p.height) FROM Package p WHERE p.shipment = :shipment")
    BigDecimal calculateTotalVolumeByShipment(@Param("shipment") Shipment shipment);
    
    /**
     * Count packages by shipment
     */
    long countByShipment(Shipment shipment);
    
    /**
     * Count packages by shipment ID
     */
    long countByShipmentId(Long shipmentId);
    
    /**
     * Count packages by package type
     */
    long countByPackageType(Package.PackageType packageType);
    
    /**
     * Find packages by multiple criteria
     */
    @Query("SELECT p FROM Package p WHERE " +
           "(:shipmentId IS NULL OR p.shipment.id = :shipmentId) AND " +
           "(:packageType IS NULL OR p.packageType = :packageType) AND " +
           "(:minWeight IS NULL OR p.weight >= :minWeight) AND " +
           "(:maxWeight IS NULL OR p.weight <= :maxWeight) AND " +
           "(:minValue IS NULL OR p.declaredValue >= :minValue) AND " +
           "(:maxValue IS NULL OR p.declaredValue <= :maxValue)")
    List<Package> searchPackages(@Param("shipmentId") Long shipmentId,
                               @Param("packageType") Package.PackageType packageType,
                               @Param("minWeight") BigDecimal minWeight,
                               @Param("maxWeight") BigDecimal maxWeight,
                               @Param("minValue") BigDecimal minValue,
                               @Param("maxValue") BigDecimal maxValue);
    
    /**
     * Get package statistics by type
     */
    @Query("SELECT p.packageType, COUNT(p), AVG(p.weight), SUM(p.weight) FROM Package p GROUP BY p.packageType")
    List<Object[]> getPackageStatsByType();
    
    /**
     * Find heaviest packages
     */
    @Query("SELECT p FROM Package p ORDER BY p.weight DESC")
    List<Package> findHeaviestPackages();
    
    /**
     * Find largest packages by volume
     */
    @Query("SELECT p FROM Package p ORDER BY (p.length * p.width * p.height) DESC")
    List<Package> findLargestPackagesByVolume();
}
