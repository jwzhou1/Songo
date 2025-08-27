package com.songo.service;

import com.songo.dto.quote.QuoteRequest;
import com.songo.model.Quote;
import com.songo.model.User;
import com.songo.repository.QuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * Service class for Quote operations
 */
@Service
@Transactional
public class QuoteService {

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private CarrierIntegrationService carrierIntegrationService;

    private final Random random = new Random();

    public Quote createQuote(QuoteRequest request, User user) {
        Quote quote = new Quote();
        
        // Set user
        quote.setUser(user);
        
        // Set origin details
        quote.setOriginAddress(request.getOriginAddress());
        quote.setOriginCity(request.getOriginCity());
        quote.setOriginState(request.getOriginState());
        quote.setOriginZip(request.getOriginZip());
        quote.setOriginCountry(request.getOriginCountry());
        
        // Set destination details
        quote.setDestinationAddress(request.getDestinationAddress());
        quote.setDestinationCity(request.getDestinationCity());
        quote.setDestinationState(request.getDestinationState());
        quote.setDestinationZip(request.getDestinationZip());
        quote.setDestinationCountry(request.getDestinationCountry());
        
        // Set shipment details
        quote.setShipmentType(request.getShipmentType());
        quote.setWeight(request.getWeight());
        quote.setWeightUnit(request.getWeightUnit());
        quote.setDimensionsLength(request.getDimensionsLength());
        quote.setDimensionsWidth(request.getDimensionsWidth());
        quote.setDimensionsHeight(request.getDimensionsHeight());
        quote.setDimensionsUnit(request.getDimensionsUnit());
        quote.setPackageCount(request.getPackageCount());
        quote.setCargoDescription(request.getCargoDescription());
        quote.setCargoValue(request.getCargoValue());
        quote.setSpecialInstructions(request.getSpecialInstructions());
        
        // Calculate estimated price and transit time
        calculateEstimates(quote);
        
        return quoteRepository.save(quote);
    }

    public Optional<Quote> getQuoteById(Long id) {
        return quoteRepository.findById(id);
    }

    public Optional<Quote> getQuoteByNumber(String quoteNumber) {
        return quoteRepository.findByQuoteNumber(quoteNumber);
    }

    public List<Quote> getUserQuotes(User user) {
        return quoteRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Page<Quote> getUserQuotes(User user, Pageable pageable) {
        return quoteRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    public Page<Quote> searchUserQuotes(User user, String searchTerm, Pageable pageable) {
        return quoteRepository.findByUserAndSearchTerm(user, searchTerm, pageable);
    }

    public Quote updateQuoteStatus(Long quoteId, Quote.QuoteStatus status, User user) {
        Optional<Quote> quoteOpt = quoteRepository.findById(quoteId);
        if (quoteOpt.isPresent()) {
            Quote quote = quoteOpt.get();
            
            // Check if user owns the quote or is admin
            if (!quote.getUser().getId().equals(user.getId()) && !user.isAdmin()) {
                throw new RuntimeException("Unauthorized to update this quote");
            }
            
            quote.setStatus(status);
            return quoteRepository.save(quote);
        }
        throw new RuntimeException("Quote not found");
    }

    public void deleteQuote(Long quoteId, User user) {
        Optional<Quote> quoteOpt = quoteRepository.findById(quoteId);
        if (quoteOpt.isPresent()) {
            Quote quote = quoteOpt.get();
            
            // Check if user owns the quote or is admin
            if (!quote.getUser().getId().equals(user.getId()) && !user.isAdmin()) {
                throw new RuntimeException("Unauthorized to delete this quote");
            }
            
            quoteRepository.delete(quote);
        } else {
            throw new RuntimeException("Quote not found");
        }
    }

    public long getUserQuoteCount(User user) {
        return quoteRepository.countByUser(user);
    }

    public long getUserQuoteCountByStatus(User user, Quote.QuoteStatus status) {
        return quoteRepository.countByUserAndStatus(user, status);
    }

    public List<Quote> getExpiredQuotes() {
        return quoteRepository.findExpiredQuotes(LocalDateTime.now(), Quote.QuoteStatus.QUOTED);
    }

    @Transactional
    public void markExpiredQuotes() {
        List<Quote> expiredQuotes = getExpiredQuotes();
        for (Quote quote : expiredQuotes) {
            quote.setStatus(Quote.QuoteStatus.EXPIRED);
            quoteRepository.save(quote);
        }
    }

    private void calculateEstimates(Quote quote) {
        // Simple pricing algorithm - in real world, this would be more complex
        double basePrice = 50.0; // Base price
        double weightFactor = quote.getWeight() * 0.5; // $0.50 per lb
        double distanceFactor = calculateDistanceFactor(quote); // Distance-based pricing
        double typeFactor = getShipmentTypeFactor(quote.getShipmentType());
        
        double totalPrice = basePrice + weightFactor + distanceFactor + typeFactor;
        
        // Add some randomness to simulate market conditions
        totalPrice = totalPrice * (0.9 + (random.nextDouble() * 0.2)); // ±10% variation
        
        quote.setEstimatedPrice(BigDecimal.valueOf(Math.round(totalPrice * 100.0) / 100.0));
        
        // Calculate transit days (simplified)
        int transitDays = calculateTransitDays(quote);
        quote.setEstimatedTransitDays(transitDays);
        
        // Set status to QUOTED
        quote.setStatus(Quote.QuoteStatus.QUOTED);
    }

    private double calculateDistanceFactor(Quote quote) {
        // Simplified distance calculation based on state differences
        // In real world, you'd use actual distance calculation APIs
        if (quote.getOriginState().equals(quote.getDestinationState())) {
            return 100.0; // Same state
        } else {
            return 300.0; // Different states
        }
    }

    private double getShipmentTypeFactor(Quote.ShipmentType type) {
        return switch (type) {
            case PARCEL -> 0.0;
            case LTL -> 100.0;
            case FTL -> 500.0;
            case FREIGHT -> 200.0;
            case EXPEDITED -> 300.0;
        };
    }

    private int calculateTransitDays(Quote quote) {
        // Simplified transit time calculation
        int baseDays = quote.getOriginState().equals(quote.getDestinationState()) ? 2 : 5;
        
        return switch (quote.getShipmentType()) {
            case PARCEL -> baseDays - 1;
            case EXPEDITED -> Math.max(1, baseDays - 2);
            case LTL -> baseDays;
            case FREIGHT -> baseDays + 1;
            case FTL -> baseDays + 2;
        };
    }

    // Additional methods for quote management

    /**
     * Save quote for later use
     */
    public Quote saveQuote(Long quoteId, User user) {
        Quote quote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new RuntimeException("Quote not found"));

        // Verify user owns the quote
        if (!quote.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to quote");
        }

        quote.setStatus(Quote.QuoteStatus.SAVED);
        return quoteRepository.save(quote);
    }

    /**
     * Convert quote to shipment (this would integrate with ShipmentService)
     */
    public Quote convertToShipment(Long quoteId, User user) {
        Quote quote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new RuntimeException("Quote not found"));

        // Verify user owns the quote
        if (!quote.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to quote");
        }

        // Update quote status to indicate it's been converted
        quote.setStatus(Quote.QuoteStatus.CONVERTED_TO_SHIPMENT);
        return quoteRepository.save(quote);
    }

    /**
     * Get saved quotes for user
     */
    @Transactional(readOnly = true)
    public List<Quote> getSavedQuotes(User user) {
        return quoteRepository.findByUserAndStatus(user, Quote.QuoteStatus.SAVED);
    }
}
