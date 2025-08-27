package com.songo.repository;

import com.songo.model.Payment;
import com.songo.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Payment entity
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Find by payment number
    Optional<Payment> findByPaymentNumber(String paymentNumber);
    
    // Find by Stripe payment intent ID
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    
    // Find by user
    List<Payment> findByUserOrderByCreatedAtDesc(User user);
    Page<Payment> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Find by payment status
    List<Payment> findByPaymentStatus(Payment.PaymentStatus paymentStatus);
    Page<Payment> findByPaymentStatus(Payment.PaymentStatus paymentStatus, Pageable pageable);
    
    // Find by user and status
    List<Payment> findByUserAndPaymentStatus(User user, Payment.PaymentStatus paymentStatus);
    Page<Payment> findByUserAndPaymentStatus(User user, Payment.PaymentStatus paymentStatus, Pageable pageable);
    
    // Find payments within date range
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<Payment> findPaymentsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    // Find payments by amount range
    @Query("SELECT p FROM Payment p WHERE p.amount BETWEEN :minAmount AND :maxAmount ORDER BY p.createdAt DESC")
    List<Payment> findPaymentsByAmountRange(@Param("minAmount") BigDecimal minAmount, 
                                           @Param("maxAmount") BigDecimal maxAmount);
    
    // Find successful payments for user
    @Query("SELECT p FROM Payment p WHERE p.user = :user AND p.paymentStatus = 'COMPLETED' ORDER BY p.createdAt DESC")
    List<Payment> findSuccessfulPaymentsByUser(@Param("user") User user);
    
    // Calculate total payments for user
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.user = :user AND p.paymentStatus = 'COMPLETED'")
    BigDecimal calculateTotalPaymentsByUser(@Param("user") User user);
    
    // Find pending payments older than specified hours
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus IN ('PENDING', 'PROCESSING') AND p.createdAt < :cutoffTime")
    List<Payment> findPendingPaymentsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find failed payments for retry
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus = 'FAILED' AND p.createdAt > :since ORDER BY p.createdAt DESC")
    List<Payment> findFailedPaymentsSince(@Param("since") LocalDateTime since);
    
    // Monthly payment statistics
    @Query("SELECT YEAR(p.createdAt) as year, MONTH(p.createdAt) as month, COUNT(p) as count, SUM(p.amount) as total " +
           "FROM Payment p WHERE p.paymentStatus = 'COMPLETED' " +
           "GROUP BY YEAR(p.createdAt), MONTH(p.createdAt) " +
           "ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlyPaymentStatistics();
    
    // Payment method statistics
    @Query("SELECT p.paymentMethod, COUNT(p) as count, SUM(p.amount) as total " +
           "FROM Payment p WHERE p.paymentStatus = 'COMPLETED' " +
           "GROUP BY p.paymentMethod")
    List<Object[]> getPaymentMethodStatistics();
    
    // Find refundable payments
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus = 'COMPLETED' AND p.refundAmount IS NULL " +
           "AND p.processedAt > :minDate ORDER BY p.processedAt DESC")
    List<Payment> findRefundablePayments(@Param("minDate") LocalDateTime minDate);
    
    // Check if user has any successful payments
    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.user = :user AND p.paymentStatus = 'COMPLETED'")
    boolean hasSuccessfulPayments(@Param("user") User user);
}
