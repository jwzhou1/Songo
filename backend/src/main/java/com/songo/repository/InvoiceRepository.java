package com.songo.repository;

import com.songo.model.Invoice;
import com.songo.model.Shipment;
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
 * Repository interface for Invoice entity
 */
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    // Find by invoice number
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    // Find by user
    List<Invoice> findByUserOrderByCreatedAtDesc(User user);
    Page<Invoice> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    // Find by user ID
    List<Invoice> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Invoice> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Find by shipment
    Optional<Invoice> findByShipment(Shipment shipment);
    
    // Find by invoice status
    List<Invoice> findByInvoiceStatus(Invoice.InvoiceStatus invoiceStatus);
    Page<Invoice> findByInvoiceStatus(Invoice.InvoiceStatus invoiceStatus, Pageable pageable);
    
    // Find by user and status
    List<Invoice> findByUserAndInvoiceStatus(User user, Invoice.InvoiceStatus invoiceStatus);
    Page<Invoice> findByUserAndInvoiceStatus(User user, Invoice.InvoiceStatus invoiceStatus, Pageable pageable);

    // Find by user ID and status
    List<Invoice> findByUserIdAndInvoiceStatusOrderByCreatedAtDesc(Long userId, Invoice.InvoiceStatus invoiceStatus);

    // Find overdue invoices by user ID
    List<Invoice> findByUserIdAndInvoiceStatusAndDueDateBeforeOrderByDueDateAsc(Long userId, Invoice.InvoiceStatus invoiceStatus, LocalDateTime dueDate);

    // Find invoice by number and user ID
    Optional<Invoice> findByInvoiceNumberAndUserId(String invoiceNumber, Long userId);
    
    // Find invoices within date range
    @Query("SELECT i FROM Invoice i WHERE i.issueDate BETWEEN :startDate AND :endDate ORDER BY i.issueDate DESC")
    List<Invoice> findInvoicesBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    // Find overdue invoices
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :currentDate AND i.invoiceStatus NOT IN ('PAID', 'CANCELLED', 'REFUNDED')")
    List<Invoice> findOverdueInvoices(@Param("currentDate") LocalDateTime currentDate);
    
    // Find invoices due soon
    @Query("SELECT i FROM Invoice i WHERE i.dueDate BETWEEN :currentDate AND :futureDate AND i.invoiceStatus NOT IN ('PAID', 'CANCELLED', 'REFUNDED')")
    List<Invoice> findInvoicesDueSoon(@Param("currentDate") LocalDateTime currentDate, 
                                     @Param("futureDate") LocalDateTime futureDate);
    
    // Calculate total amount for user
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.user = :user AND i.invoiceStatus = 'PAID'")
    BigDecimal calculateTotalInvoicesByUser(@Param("user") User user);
    
    // Calculate outstanding amount for user
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.user = :user AND i.invoiceStatus NOT IN ('PAID', 'CANCELLED', 'REFUNDED')")
    BigDecimal calculateOutstandingAmountByUser(@Param("user") User user);
    
    // Find unpaid invoices for user
    @Query("SELECT i FROM Invoice i WHERE i.user = :user AND i.invoiceStatus NOT IN ('PAID', 'CANCELLED', 'REFUNDED') ORDER BY i.dueDate ASC")
    List<Invoice> findUnpaidInvoicesByUser(@Param("user") User user);
    
    // Monthly invoice statistics
    @Query("SELECT YEAR(i.issueDate) as year, MONTH(i.issueDate) as month, COUNT(i) as count, SUM(i.totalAmount) as total " +
           "FROM Invoice i WHERE i.invoiceStatus = 'PAID' " +
           "GROUP BY YEAR(i.issueDate), MONTH(i.issueDate) " +
           "ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlyInvoiceStatistics();
    
    // Invoice status statistics
    @Query("SELECT i.invoiceStatus, COUNT(i) as count, SUM(i.totalAmount) as total " +
           "FROM Invoice i " +
           "GROUP BY i.invoiceStatus")
    List<Object[]> getInvoiceStatusStatistics();
    
    // Find invoices by amount range
    @Query("SELECT i FROM Invoice i WHERE i.totalAmount BETWEEN :minAmount AND :maxAmount ORDER BY i.issueDate DESC")
    List<Invoice> findInvoicesByAmountRange(@Param("minAmount") BigDecimal minAmount, 
                                           @Param("maxAmount") BigDecimal maxAmount);
    
    // Find recent invoices for user
    @Query("SELECT i FROM Invoice i WHERE i.user = :user AND i.issueDate > :since ORDER BY i.issueDate DESC")
    List<Invoice> findRecentInvoicesByUser(@Param("user") User user, @Param("since") LocalDateTime since);
    
    // Check if user has any invoices
    @Query("SELECT COUNT(i) > 0 FROM Invoice i WHERE i.user = :user")
    boolean hasInvoices(@Param("user") User user);
    
    // Find invoices needing PDF generation
    @Query("SELECT i FROM Invoice i WHERE i.pdfUrl IS NULL AND i.invoiceStatus != 'DRAFT'")
    List<Invoice> findInvoicesNeedingPdfGeneration();
    
    // Search invoices by billing information
    @Query("SELECT i FROM Invoice i WHERE " +
           "LOWER(i.billingName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.billingEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Invoice> searchInvoices(@Param("searchTerm") String searchTerm);

    // Search invoices by criteria (for InvoiceService)
    @Query("SELECT i FROM Invoice i WHERE " +
           "(:userId IS NULL OR i.user.id = :userId) AND " +
           "(:invoiceNumber IS NULL OR i.invoiceNumber LIKE %:invoiceNumber%) AND " +
           "(:status IS NULL OR i.invoiceStatus = :status) AND " +
           "(:fromDate IS NULL OR i.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR i.createdAt <= :toDate) " +
           "ORDER BY i.createdAt DESC")
    List<Invoice> searchInvoices(@Param("userId") Long userId,
                                @Param("invoiceNumber") String invoiceNumber,
                                @Param("status") Invoice.InvoiceStatus status,
                                @Param("fromDate") LocalDateTime fromDate,
                                @Param("toDate") LocalDateTime toDate);

    // Find top N invoices by user ID ordered by creation date
    @Query("SELECT i FROM Invoice i WHERE i.user.id = :userId ORDER BY i.createdAt DESC")
    List<Invoice> findTopNByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    default List<Invoice> findTopNByUserIdOrderByCreatedAtDesc(Long userId, int limit) {
        return findTopNByUserIdOrderByCreatedAtDesc(userId, Pageable.ofSize(limit));
    }
}
