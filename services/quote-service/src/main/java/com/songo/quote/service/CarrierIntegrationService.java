package com.songo.quote.service;

import com.songo.quote.model.ShippingQuote;
import com.songo.quote.integration.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.ArrayList;

/**
 * Service for integrating with multiple shipping carriers
 * Supports real-time rate shopping across all major carriers
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CarrierIntegrationService {

    private final FedExIntegrationService fedExService;
    private final UPSIntegrationService upsService;
    private final DHLIntegrationService dhlService;
    private final USPSIntegrationService uspsService;
    private final CanadaPostIntegrationService canadaPostService;
    private final PurolatorIntegrationService purolatorService;

    /**
     * Get quotes from all available carriers asynchronously
     */
    public CompletableFuture<List<ShippingQuote.CarrierQuote>> getAllCarrierQuotes(ShippingQuote quote) {
        log.info("Getting quotes from all carriers for quote: {}", quote.getQuoteNumber());

        List<CompletableFuture<ShippingQuote.CarrierQuote>> futures = new ArrayList<>();

        // Add carrier quote futures based on shipment type and destination
        if (isCarrierAvailable("FEDEX", quote)) {
            futures.add(getFedExQuote(quote));
        }
        
        if (isCarrierAvailable("UPS", quote)) {
            futures.add(getUPSQuote(quote));
        }
        
        if (isCarrierAvailable("DHL", quote)) {
            futures.add(getDHLQuote(quote));
        }
        
        if (isCarrierAvailable("USPS", quote)) {
            futures.add(getUSPSQuote(quote));
        }
        
        if (isCarrierAvailable("CANADA_POST", quote)) {
            futures.add(getCanadaPostQuote(quote));
        }
        
        if (isCarrierAvailable("PUROLATOR", quote)) {
            futures.add(getPurolatorQuote(quote));
        }

        // Wait for all futures to complete and collect results
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                        .map(CompletableFuture::join)
                        .filter(carrierQuote -> carrierQuote != null && carrierQuote.isAvailable())
                        .collect(Collectors.toList()));
    }

    @Async
    public CompletableFuture<ShippingQuote.CarrierQuote> getFedExQuote(ShippingQuote quote) {
        try {
            log.debug("Getting FedEx quote for: {}", quote.getQuoteNumber());
            return CompletableFuture.completedFuture(fedExService.getQuote(quote));
        } catch (Exception e) {
            log.error("Error getting FedEx quote: {}", e.getMessage());
            return CompletableFuture.completedFuture(createErrorQuote("FEDEX", "FedEx", e.getMessage()));
        }
    }

    @Async
    public CompletableFuture<ShippingQuote.CarrierQuote> getUPSQuote(ShippingQuote quote) {
        try {
            log.debug("Getting UPS quote for: {}", quote.getQuoteNumber());
            return CompletableFuture.completedFuture(upsService.getQuote(quote));
        } catch (Exception e) {
            log.error("Error getting UPS quote: {}", e.getMessage());
            return CompletableFuture.completedFuture(createErrorQuote("UPS", "UPS", e.getMessage()));
        }
    }

    @Async
    public CompletableFuture<ShippingQuote.CarrierQuote> getDHLQuote(ShippingQuote quote) {
        try {
            log.debug("Getting DHL quote for: {}", quote.getQuoteNumber());
            return CompletableFuture.completedFuture(dhlService.getQuote(quote));
        } catch (Exception e) {
            log.error("Error getting DHL quote: {}", e.getMessage());
            return CompletableFuture.completedFuture(createErrorQuote("DHL", "DHL", e.getMessage()));
        }
    }

    @Async
    public CompletableFuture<ShippingQuote.CarrierQuote> getUSPSQuote(ShippingQuote quote) {
        try {
            log.debug("Getting USPS quote for: {}", quote.getQuoteNumber());
            return CompletableFuture.completedFuture(uspsService.getQuote(quote));
        } catch (Exception e) {
            log.error("Error getting USPS quote: {}", e.getMessage());
            return CompletableFuture.completedFuture(createErrorQuote("USPS", "USPS", e.getMessage()));
        }
    }

    @Async
    public CompletableFuture<ShippingQuote.CarrierQuote> getCanadaPostQuote(ShippingQuote quote) {
        try {
            log.debug("Getting Canada Post quote for: {}", quote.getQuoteNumber());
            return CompletableFuture.completedFuture(canadaPostService.getQuote(quote));
        } catch (Exception e) {
            log.error("Error getting Canada Post quote: {}", e.getMessage());
            return CompletableFuture.completedFuture(createErrorQuote("CANADA_POST", "Canada Post", e.getMessage()));
        }
    }

    @Async
    public CompletableFuture<ShippingQuote.CarrierQuote> getPurolatorQuote(ShippingQuote quote) {
        try {
            log.debug("Getting Purolator quote for: {}", quote.getQuoteNumber());
            return CompletableFuture.completedFuture(purolatorService.getQuote(quote));
        } catch (Exception e) {
            log.error("Error getting Purolator quote: {}", e.getMessage());
            return CompletableFuture.completedFuture(createErrorQuote("PUROLATOR", "Purolator", e.getMessage()));
        }
    }

    /**
     * Check if carrier is available for the given quote
     */
    private boolean isCarrierAvailable(String carrierId, ShippingQuote quote) {
        // Check based on shipment type, destination, weight, etc.
        switch (carrierId) {
            case "FEDEX":
                return isFedExAvailable(quote);
            case "UPS":
                return isUPSAvailable(quote);
            case "DHL":
                return isDHLAvailable(quote);
            case "USPS":
                return isUSPSAvailable(quote);
            case "CANADA_POST":
                return isCanadaPostAvailable(quote);
            case "PUROLATOR":
                return isPurolatorAvailable(quote);
            default:
                return false;
        }
    }

    private boolean isFedExAvailable(ShippingQuote quote) {
        // FedEx supports most shipment types and destinations
        return true;
    }

    private boolean isUPSAvailable(ShippingQuote quote) {
        // UPS supports most shipment types and destinations
        return true;
    }

    private boolean isDHLAvailable(ShippingQuote quote) {
        // DHL is best for international shipments
        return quote.getShipmentType() == ShippingQuote.ShipmentType.INTERNATIONAL ||
               !quote.getDestinationAddress().getCountry().equalsIgnoreCase("US");
    }

    private boolean isUSPSAvailable(ShippingQuote quote) {
        // USPS is good for small parcels and domestic shipments
        return quote.getShipmentType() == ShippingQuote.ShipmentType.PARCEL &&
               quote.getDestinationAddress().getCountry().equalsIgnoreCase("US");
    }

    private boolean isCanadaPostAvailable(ShippingQuote quote) {
        // Canada Post for Canadian destinations
        return quote.getDestinationAddress().getCountry().equalsIgnoreCase("CA") ||
               quote.getOriginAddress().getCountry().equalsIgnoreCase("CA");
    }

    private boolean isPurolatorAvailable(ShippingQuote quote) {
        // Purolator for Canadian destinations
        return quote.getDestinationAddress().getCountry().equalsIgnoreCase("CA") ||
               quote.getOriginAddress().getCountry().equalsIgnoreCase("CA");
    }

    private ShippingQuote.CarrierQuote createErrorQuote(String carrierId, String carrierName, String errorMessage) {
        ShippingQuote.CarrierQuote errorQuote = new ShippingQuote.CarrierQuote();
        errorQuote.setCarrierId(carrierId);
        errorQuote.setCarrierName(carrierName);
        errorQuote.setAvailable(false);
        errorQuote.setErrorMessage(errorMessage);
        errorQuote.setQuotedAt(java.time.LocalDateTime.now());
        return errorQuote;
    }

    /**
     * Get the best quote based on price, transit time, and carrier reliability
     */
    public ShippingQuote.CarrierQuote getBestQuote(List<ShippingQuote.CarrierQuote> quotes) {
        return quotes.stream()
                .filter(ShippingQuote.CarrierQuote::isAvailable)
                .min((q1, q2) -> {
                    // Primary sort by total cost
                    int costComparison = q1.getTotalCost().compareTo(q2.getTotalCost());
                    if (costComparison != 0) {
                        return costComparison;
                    }
                    // Secondary sort by transit days
                    return Integer.compare(q1.getTransitDays(), q2.getTransitDays());
                })
                .orElse(null);
    }
}
