package com.songo.controller;

import com.songo.dto.quote.QuoteRequest;
import com.songo.model.Quote;
import com.songo.model.User;
import com.songo.service.QuoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for Quote operations
 */
@RestController
@RequestMapping("/api/quotes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class QuoteController {

    @Autowired
    private QuoteService quoteService;

    @PostMapping
    public ResponseEntity<?> createQuote(@Valid @RequestBody QuoteRequest request, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Quote quote = quoteService.createQuote(request, user);
            return ResponseEntity.ok(quote);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create quote: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserQuotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        
        try {
            User user = (User) authentication.getPrincipal();
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Quote> quotes;
            if (search != null && !search.trim().isEmpty()) {
                quotes = quoteService.searchUserQuotes(user, search.trim(), pageable);
            } else {
                quotes = quoteService.getUserQuotes(user, pageable);
            }
            
            return ResponseEntity.ok(quotes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch quotes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuoteById(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Quote> quoteOpt = quoteService.getQuoteById(id);
            
            if (quoteOpt.isPresent()) {
                Quote quote = quoteOpt.get();
                
                // Check if user owns the quote or is admin
                if (!quote.getUser().getId().equals(user.getId()) && !user.isAdmin()) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Unauthorized to view this quote");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
                
                return ResponseEntity.ok(quote);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Quote not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch quote: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/number/{quoteNumber}")
    public ResponseEntity<?> getQuoteByNumber(@PathVariable String quoteNumber, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Quote> quoteOpt = quoteService.getQuoteByNumber(quoteNumber);
            
            if (quoteOpt.isPresent()) {
                Quote quote = quoteOpt.get();
                
                // Check if user owns the quote or is admin
                if (!quote.getUser().getId().equals(user.getId()) && !user.isAdmin()) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Unauthorized to view this quote");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
                
                return ResponseEntity.ok(quote);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Quote not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch quote: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateQuoteStatus(
            @PathVariable Long id,
            @RequestParam Quote.QuoteStatus status,
            Authentication authentication) {
        
        try {
            User user = (User) authentication.getPrincipal();
            Quote updatedQuote = quoteService.updateQuoteStatus(id, status, user);
            return ResponseEntity.ok(updatedQuote);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update quote status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuote(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            quoteService.deleteQuote(id, user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Quote deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete quote: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserQuoteStats(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalQuotes", quoteService.getUserQuoteCount(user));
            stats.put("pendingQuotes", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.PENDING));
            stats.put("quotedQuotes", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.QUOTED));
            stats.put("acceptedQuotes", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.ACCEPTED));
            stats.put("rejectedQuotes", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.REJECTED));
            stats.put("expiredQuotes", quoteService.getUserQuoteCountByStatus(user, Quote.QuoteStatus.EXPIRED));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch quote statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Public endpoint for quick quote (no authentication required)
    @PostMapping("/public/quick")
    public ResponseEntity<?> getQuickQuote(@Valid @RequestBody QuoteRequest request) {
        try {
            // Create a temporary quote for estimation without saving to database
            Quote tempQuote = new Quote();
            tempQuote.setShipmentType(request.getShipmentType());
            tempQuote.setWeight(request.getWeight());
            tempQuote.setOriginState(request.getOriginState());
            tempQuote.setDestinationState(request.getDestinationState());
            
            // Use the same calculation logic from QuoteService
            // This is a simplified version for quick quotes
            double basePrice = 50.0;
            double weightFactor = request.getWeight() * 0.5;
            double distanceFactor = request.getOriginState().equals(request.getDestinationState()) ? 100.0 : 300.0;
            double typeFactor = switch (request.getShipmentType()) {
                case PARCEL -> 0.0;
                case LTL -> 100.0;
                case FTL -> 500.0;
                case FREIGHT -> 200.0;
                case EXPEDITED -> 300.0;
            };
            
            double totalPrice = basePrice + weightFactor + distanceFactor + typeFactor;
            
            Map<String, Object> quickQuote = new HashMap<>();
            quickQuote.put("estimatedPrice", Math.round(totalPrice * 100.0) / 100.0);
            quickQuote.put("estimatedTransitDays", request.getOriginState().equals(request.getDestinationState()) ? 2 : 5);
            quickQuote.put("message", "This is an estimated quote. Please register to get an official quote.");
            
            return ResponseEntity.ok(quickQuote);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to generate quick quote: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
