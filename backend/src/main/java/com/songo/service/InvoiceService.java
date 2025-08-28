package com.songo.service;

import com.songo.model.Invoice;
import com.songo.model.Shipment;
import com.songo.model.User;
import com.songo.repository.InvoiceRepository;
import com.songo.repository.ShipmentRepository;
import com.songo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing customer invoices and billing
 */
@Service
@Transactional
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create invoice for a shipment
     */
    public Invoice createInvoiceForShipment(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new RuntimeException("Shipment not found"));

        // Check if invoice already exists for this shipment
        Optional<Invoice> existingInvoice = invoiceRepository.findByShipment(shipment);
        if (existingInvoice.isPresent()) {
            return existingInvoice.get();
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setUser(shipment.getUser());
        invoice.setShipment(shipment);
        invoice.setAmount(shipment.getTotalCost());
        invoice.setTaxAmount(calculateTax(shipment.getTotalCost()));
        invoice.setTotalAmount(invoice.getAmount().add(invoice.getTaxAmount()));
        invoice.setStatus(Invoice.InvoiceStatus.PENDING);
        invoice.setDueDate(LocalDateTime.now().plusDays(30)); // 30 days payment terms
        invoice.setCreatedAt(LocalDateTime.now());

        return invoiceRepository.save(invoice);
    }

    /**
     * Get all invoices for a user with pagination
     */
    public Page<Invoice> getUserInvoices(Long userId, Pageable pageable) {
        return invoiceRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * Get all invoices for a user
     */
    public List<Invoice> getUserInvoices(Long userId) {
        return invoiceRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get invoices by status for a user
     */
    public List<Invoice> getUserInvoicesByStatus(Long userId, Invoice.InvoiceStatus status) {
        return invoiceRepository.findByUserIdAndInvoiceStatusOrderByCreatedAtDesc(userId, status);
    }

    /**
     * Get overdue invoices for a user
     */
    public List<Invoice> getUserOverdueInvoices(Long userId) {
        return invoiceRepository.findByUserIdAndInvoiceStatusAndDueDateBeforeOrderByDueDateAsc(
            userId, Invoice.InvoiceStatus.PENDING, LocalDateTime.now());
    }

    /**
     * Get invoice by invoice number and user
     */
    public Optional<Invoice> getInvoiceByNumber(String invoiceNumber, Long userId) {
        return invoiceRepository.findByInvoiceNumberAndUserId(invoiceNumber, userId);
    }

    /**
     * Pay invoice
     */
    public Invoice payInvoice(Long invoiceId, Long userId, String paymentMethod, String transactionId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (!invoice.getUser().getId().equals(userId)) {
            throw new RuntimeException("Invoice does not belong to user");
        }

        if (invoice.getStatus() != Invoice.InvoiceStatus.PENDING) {
            throw new RuntimeException("Invoice is not in pending status");
        }

        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        invoice.setPaymentMethod(paymentMethod);
        invoice.setTransactionId(transactionId);
        invoice.setUpdatedAt(LocalDateTime.now());

        return invoiceRepository.save(invoice);
    }

    /**
     * Cancel invoice
     */
    public Invoice cancelInvoice(Long invoiceId, String reason) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            throw new RuntimeException("Cannot cancel paid invoice");
        }

        invoice.setStatus(Invoice.InvoiceStatus.CANCELLED);
        invoice.setNotes(reason);
        invoice.setUpdatedAt(LocalDateTime.now());

        return invoiceRepository.save(invoice);
    }

    /**
     * Get invoice statistics for a user
     */
    public InvoiceStats getUserInvoiceStats(Long userId) {
        List<Invoice> allInvoices = getUserInvoices(userId);
        
        InvoiceStats stats = new InvoiceStats();
        stats.setTotalInvoices(allInvoices.size());
        stats.setPendingInvoices((int) allInvoices.stream()
            .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PENDING)
            .count());
        stats.setPaidInvoices((int) allInvoices.stream()
            .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID)
            .count());
        stats.setOverdueInvoices((int) allInvoices.stream()
            .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PENDING && 
                        i.getDueDate().isBefore(LocalDateTime.now()))
            .count());
        
        // Calculate total amounts
        BigDecimal totalAmount = allInvoices.stream()
            .filter(i -> i.getTotalAmount() != null)
            .map(Invoice::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalAmount(totalAmount);

        BigDecimal paidAmount = allInvoices.stream()
            .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID && i.getTotalAmount() != null)
            .map(Invoice::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setPaidAmount(paidAmount);

        BigDecimal pendingAmount = allInvoices.stream()
            .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PENDING && i.getTotalAmount() != null)
            .map(Invoice::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setPendingAmount(pendingAmount);

        return stats;
    }

    /**
     * Search invoices by various criteria
     */
    public List<Invoice> searchUserInvoices(Long userId, String invoiceNumber, 
                                          Invoice.InvoiceStatus status, 
                                          LocalDateTime fromDate, 
                                          LocalDateTime toDate) {
        return invoiceRepository.searchInvoices(userId, invoiceNumber, status, fromDate, toDate);
    }

    /**
     * Get recent invoices for a user
     */
    public List<Invoice> getRecentInvoices(Long userId, int limit) {
        return invoiceRepository.findTopNByUserIdOrderByCreatedAtDesc(userId, limit);
    }

    /**
     * Generate a unique invoice number
     */
    private String generateInvoiceNumber() {
        String prefix = "INV";
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long sequence = invoiceRepository.count() + 1;
        return prefix + "-" + dateStr + "-" + String.format("%04d", sequence);
    }

    /**
     * Calculate tax amount (simplified - 13% HST for Canada)
     */
    private BigDecimal calculateTax(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO;
        }
        return amount.multiply(new BigDecimal("0.13")).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    /**
     * Generate invoice PDF (placeholder - would integrate with PDF library)
     */
    public byte[] generateInvoicePDF(Long invoiceId, Long userId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (!invoice.getUser().getId().equals(userId)) {
            throw new RuntimeException("Invoice does not belong to user");
        }

        // TODO: Implement PDF generation using libraries like iText or Apache PDFBox
        // For now, return placeholder
        return "PDF content would be generated here".getBytes();
    }

    /**
     * Send invoice email (placeholder - would integrate with email service)
     */
    public void sendInvoiceEmail(Long invoiceId, Long userId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (!invoice.getUser().getId().equals(userId)) {
            throw new RuntimeException("Invoice does not belong to user");
        }

        // TODO: Implement email sending
        System.out.println("Invoice email would be sent to: " + invoice.getUser().getEmail());
    }

    /**
     * Inner class for invoice statistics
     */
    public static class InvoiceStats {
        private int totalInvoices;
        private int pendingInvoices;
        private int paidInvoices;
        private int overdueInvoices;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal pendingAmount;

        // Getters and setters
        public int getTotalInvoices() { return totalInvoices; }
        public void setTotalInvoices(int totalInvoices) { this.totalInvoices = totalInvoices; }

        public int getPendingInvoices() { return pendingInvoices; }
        public void setPendingInvoices(int pendingInvoices) { this.pendingInvoices = pendingInvoices; }

        public int getPaidInvoices() { return paidInvoices; }
        public void setPaidInvoices(int paidInvoices) { this.paidInvoices = paidInvoices; }

        public int getOverdueInvoices() { return overdueInvoices; }
        public void setOverdueInvoices(int overdueInvoices) { this.overdueInvoices = overdueInvoices; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public BigDecimal getPaidAmount() { return paidAmount; }
        public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

        public BigDecimal getPendingAmount() { return pendingAmount; }
        public void setPendingAmount(BigDecimal pendingAmount) { this.pendingAmount = pendingAmount; }
    }
}
