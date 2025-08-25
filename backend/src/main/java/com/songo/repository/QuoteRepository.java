package com.songo.repository;

import com.songo.model.Quote;
import com.songo.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Quote entity
 */
@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long> {
    
    Optional<Quote> findByQuoteNumber(String quoteNumber);
    
    List<Quote> findByUser(User user);
    
    Page<Quote> findByUser(User user, Pageable pageable);
    
    List<Quote> findByUserOrderByCreatedAtDesc(User user);
    
    Page<Quote> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Quote> findByStatus(Quote.QuoteStatus status);
    
    Page<Quote> findByStatus(Quote.QuoteStatus status, Pageable pageable);
    
    List<Quote> findByUserAndStatus(User user, Quote.QuoteStatus status);
    
    Page<Quote> findByUserAndStatus(User user, Quote.QuoteStatus status, Pageable pageable);
    
    @Query("SELECT q FROM Quote q WHERE q.validUntil < :currentTime AND q.status = :status")
    List<Quote> findExpiredQuotes(@Param("currentTime") LocalDateTime currentTime, 
                                 @Param("status") Quote.QuoteStatus status);
    
    @Query("SELECT q FROM Quote q WHERE q.user = :user AND " +
           "(LOWER(q.quoteNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.originCity) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.destinationCity) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Quote> findByUserAndSearchTerm(@Param("user") User user, 
                                       @Param("search") String search, 
                                       Pageable pageable);
    
    @Query("SELECT COUNT(q) FROM Quote q WHERE q.user = :user")
    long countByUser(@Param("user") User user);
    
    @Query("SELECT COUNT(q) FROM Quote q WHERE q.user = :user AND q.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") Quote.QuoteStatus status);
    
    boolean existsByQuoteNumber(String quoteNumber);
}
