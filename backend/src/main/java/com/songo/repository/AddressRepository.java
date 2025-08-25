package com.songo.repository;

import com.songo.model.Address;
import com.songo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Address entity
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    /**
     * Find addresses by user
     */
    List<Address> findByUser(User user);
    
    /**
     * Find addresses by user ID
     */
    List<Address> findByUserId(Long userId);
    
    /**
     * Find addresses by user and type
     */
    List<Address> findByUserAndType(User user, Address.AddressType type);
    
    /**
     * Find addresses by user ID and type
     */
    List<Address> findByUserIdAndType(Long userId, Address.AddressType type);
    
    /**
     * Find default address by user and type
     */
    Optional<Address> findByUserAndTypeAndIsDefaultTrue(User user, Address.AddressType type);
    
    /**
     * Find default address by user ID and type
     */
    Optional<Address> findByUserIdAndTypeAndIsDefaultTrue(Long userId, Address.AddressType type);
    
    /**
     * Find addresses by postal code
     */
    List<Address> findByPostalCode(String postalCode);
    
    /**
     * Find addresses by city and province
     */
    List<Address> findByCityAndProvince(String city, String province);
    
    /**
     * Find addresses by country
     */
    List<Address> findByCountry(String country);
    
    /**
     * Find residential addresses
     */
    List<Address> findByIsResidentialTrue();
    
    /**
     * Find commercial addresses
     */
    List<Address> findByIsResidentialFalse();
    
    /**
     * Search addresses by contact name
     */
    @Query("SELECT a FROM Address a WHERE LOWER(a.contactName) LIKE LOWER(CONCAT('%', :contactName, '%'))")
    List<Address> findByContactNameContaining(@Param("contactName") String contactName);
    
    /**
     * Search addresses by company name
     */
    @Query("SELECT a FROM Address a WHERE LOWER(a.companyName) LIKE LOWER(CONCAT('%', :companyName, '%'))")
    List<Address> findByCompanyNameContaining(@Param("companyName") String companyName);
    
    /**
     * Find addresses within a postal code range (for Canadian postal codes)
     */
    @Query("SELECT a FROM Address a WHERE a.postalCode LIKE CONCAT(:postalCodePrefix, '%')")
    List<Address> findByPostalCodePrefix(@Param("postalCodePrefix") String postalCodePrefix);
    
    /**
     * Count addresses by user
     */
    long countByUser(User user);
    
    /**
     * Count addresses by user ID
     */
    long countByUserId(Long userId);
    
    /**
     * Check if user has default address of specific type
     */
    boolean existsByUserAndTypeAndIsDefaultTrue(User user, Address.AddressType type);
    
    /**
     * Find addresses by multiple criteria
     */
    @Query("SELECT a FROM Address a WHERE " +
           "(:userId IS NULL OR a.user.id = :userId) AND " +
           "(:type IS NULL OR a.type = :type) AND " +
           "(:city IS NULL OR LOWER(a.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:province IS NULL OR LOWER(a.province) LIKE LOWER(CONCAT('%', :province, '%'))) AND " +
           "(:country IS NULL OR a.country = :country) AND " +
           "(:isResidential IS NULL OR a.isResidential = :isResidential)")
    List<Address> searchAddresses(@Param("userId") Long userId,
                                 @Param("type") Address.AddressType type,
                                 @Param("city") String city,
                                 @Param("province") String province,
                                 @Param("country") String country,
                                 @Param("isResidential") Boolean isResidential);
}
