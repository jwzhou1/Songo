package com.songo.service;

import com.songo.dto.quote.QuoteRequest;
import com.songo.dto.quote.QuoteResponse;
import com.songo.model.Quote;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service for integrating with real carrier APIs
 */
@Service
public class CarrierIntegrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(CarrierIntegrationService.class);
    
    private final RestTemplate restTemplate;
    
    // FedEx Configuration
    @Value("${carriers.fedex.api-url:https://apis.fedex.com}")
    private String fedexApiUrl;
    
    @Value("${carriers.fedex.api-key:}")
    private String fedexApiKey;
    
    @Value("${carriers.fedex.secret-key:}")
    private String fedexSecretKey;
    
    // UPS Configuration
    @Value("${carriers.ups.api-url:https://wwwcie.ups.com}")
    private String upsApiUrl;
    
    @Value("${carriers.ups.username:}")
    private String upsUsername;
    
    @Value("${carriers.ups.password:}")
    private String upsPassword;
    
    @Value("${carriers.ups.access-key:}")
    private String upsAccessKey;
    
    // DHL Configuration
    @Value("${carriers.dhl.api-url:https://api-test.dhl.com}")
    private String dhlApiUrl;
    
    @Value("${carriers.dhl.api-key:}")
    private String dhlApiKey;
    
    // USPS Configuration
    @Value("${carriers.usps.api-url:https://secure.shippingapis.com}")
    private String uspsApiUrl;
    
    @Value("${carriers.usps.user-id:}")
    private String uspsUserId;
    
    public CarrierIntegrationService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Get quotes from all available carriers
     */
    public List<QuoteResponse> getAllCarrierQuotes(QuoteRequest request) {
        List<QuoteResponse> allQuotes = new ArrayList<>();
        
        // Get quotes from each carrier in parallel (simplified for demo)
        try {
            allQuotes.addAll(getFedExQuotes(request));
        } catch (Exception e) {
            logger.warn("Failed to get FedEx quotes: {}", e.getMessage());
        }
        
        try {
            allQuotes.addAll(getUPSQuotes(request));
        } catch (Exception e) {
            logger.warn("Failed to get UPS quotes: {}", e.getMessage());
        }
        
        try {
            allQuotes.addAll(getDHLQuotes(request));
        } catch (Exception e) {
            logger.warn("Failed to get DHL quotes: {}", e.getMessage());
        }
        
        try {
            allQuotes.addAll(getUSPSQuotes(request));
        } catch (Exception e) {
            logger.warn("Failed to get USPS quotes: {}", e.getMessage());
        }
        
        // Sort by price
        allQuotes.sort(Comparator.comparing(QuoteResponse::getPrice));
        
        return allQuotes;
    }
    
    /**
     * Get FedEx quotes
     */
    private List<QuoteResponse> getFedExQuotes(QuoteRequest request) {
        List<QuoteResponse> quotes = new ArrayList<>();
        
        if (fedexApiKey.isEmpty()) {
            // Return demo data if no API key configured
            return getFedExDemoQuotes(request);
        }
        
        try {
            // FedEx OAuth token request
            String accessToken = getFedExAccessToken();
            
            // Build FedEx rate request
            Map<String, Object> rateRequest = buildFedExRateRequest(request);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(rateRequest, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                fedexApiUrl + "/rate/v1/rates/quotes", 
                entity, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                quotes = parseFedExResponse(response.getBody());
            }
            
        } catch (HttpClientErrorException e) {
            logger.error("FedEx API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            // Fallback to demo data
            return getFedExDemoQuotes(request);
        } catch (Exception e) {
            logger.error("Error calling FedEx API: {}", e.getMessage(), e);
            // Fallback to demo data
            return getFedExDemoQuotes(request);
        }
        
        return quotes;
    }
    
    /**
     * Get FedEx OAuth access token
     */
    private String getFedExAccessToken() {
        Map<String, String> tokenRequest = new HashMap<>();
        tokenRequest.put("grant_type", "client_credentials");
        tokenRequest.put("client_id", fedexApiKey);
        tokenRequest.put("client_secret", fedexSecretKey);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(tokenRequest, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(
            fedexApiUrl + "/oauth/token", 
            entity, 
            Map.class
        );
        
        Map<String, Object> responseBody = response.getBody();
        return (String) responseBody.get("access_token");
    }
    
    /**
     * Build FedEx rate request payload
     */
    private Map<String, Object> buildFedExRateRequest(QuoteRequest request) {
        Map<String, Object> rateRequest = new HashMap<>();
        
        // Account information
        Map<String, Object> accountNumber = new HashMap<>();
        accountNumber.put("value", "YOUR_FEDEX_ACCOUNT_NUMBER");
        rateRequest.put("accountNumber", accountNumber);
        
        // Requested shipment
        Map<String, Object> requestedShipment = new HashMap<>();
        
        // Shipper
        Map<String, Object> shipper = new HashMap<>();
        Map<String, Object> shipperAddress = new HashMap<>();
        shipperAddress.put("streetLines", Arrays.asList(request.getOriginAddress()));
        shipperAddress.put("city", request.getOriginCity());
        shipperAddress.put("stateOrProvinceCode", request.getOriginState());
        shipperAddress.put("postalCode", request.getOriginZip());
        shipperAddress.put("countryCode", request.getOriginCountry());
        shipper.put("address", shipperAddress);
        requestedShipment.put("shipper", shipper);
        
        // Recipient
        Map<String, Object> recipient = new HashMap<>();
        Map<String, Object> recipientAddress = new HashMap<>();
        recipientAddress.put("streetLines", Arrays.asList(request.getDestinationAddress()));
        recipientAddress.put("city", request.getDestinationCity());
        recipientAddress.put("stateOrProvinceCode", request.getDestinationState());
        recipientAddress.put("postalCode", request.getDestinationZip());
        recipientAddress.put("countryCode", request.getDestinationCountry());
        recipient.put("address", recipientAddress);
        requestedShipment.put("recipients", Arrays.asList(recipient));
        
        // Package details
        Map<String, Object> requestedPackageLineItems = new HashMap<>();
        Map<String, Object> weight = new HashMap<>();
        weight.put("value", request.getWeight());
        weight.put("units", "LB");
        requestedPackageLineItems.put("weight", weight);
        
        if (request.getDimensionsLength() != null) {
            Map<String, Object> dimensions = new HashMap<>();
            dimensions.put("length", request.getDimensionsLength());
            dimensions.put("width", request.getDimensionsWidth());
            dimensions.put("height", request.getDimensionsHeight());
            dimensions.put("units", "IN");
            requestedPackageLineItems.put("dimensions", dimensions);
        }
        
        requestedShipment.put("requestedPackageLineItems", Arrays.asList(requestedPackageLineItems));
        
        rateRequest.put("requestedShipment", requestedShipment);
        
        return rateRequest;
    }
    
    /**
     * Parse FedEx API response
     */
    private List<QuoteResponse> parseFedExResponse(Map<String, Object> responseBody) {
        List<QuoteResponse> quotes = new ArrayList<>();
        
        try {
            Map<String, Object> output = (Map<String, Object>) responseBody.get("output");
            List<Map<String, Object>> rateReplyDetails = (List<Map<String, Object>>) output.get("rateReplyDetails");
            
            for (Map<String, Object> rateDetail : rateReplyDetails) {
                String serviceType = (String) rateDetail.get("serviceType");
                List<Map<String, Object>> ratedShipmentDetails = (List<Map<String, Object>>) rateDetail.get("ratedShipmentDetails");
                
                for (Map<String, Object> shipmentDetail : ratedShipmentDetails) {
                    Map<String, Object> totalNetCharge = (Map<String, Object>) shipmentDetail.get("totalNetCharge");
                    Double amount = (Double) totalNetCharge.get("amount");
                    String currency = (String) totalNetCharge.get("currency");
                    
                    Map<String, Object> operationalDetail = (Map<String, Object>) rateDetail.get("operationalDetail");
                    Integer transitDays = (Integer) operationalDetail.get("transitTime");
                    
                    QuoteResponse quote = new QuoteResponse();
                    quote.setCarrierName("FedEx");
                    quote.setServiceName(getServiceDisplayName("FEDEX", serviceType));
                    quote.setServiceCode(serviceType);
                    quote.setPrice(BigDecimal.valueOf(amount));
                    quote.setCurrency(currency);
                    quote.setEstimatedTransitDays(transitDays);
                    quote.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(transitDays));
                    
                    quotes.add(quote);
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing FedEx response: {}", e.getMessage(), e);
        }
        
        return quotes;
    }
    
    /**
     * Get demo FedEx quotes (fallback when API is not configured)
     */
    private List<QuoteResponse> getFedExDemoQuotes(QuoteRequest request) {
        List<QuoteResponse> quotes = new ArrayList<>();
        
        // FedEx Ground
        QuoteResponse ground = new QuoteResponse();
        ground.setCarrierName("FedEx");
        ground.setServiceName("FedEx Ground");
        ground.setServiceCode("FEDEX_GROUND");
        ground.setPrice(calculateDemoPrice(request, 0.85));
        ground.setCurrency("USD");
        ground.setEstimatedTransitDays(5);
        ground.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(5));
        quotes.add(ground);
        
        // FedEx Express Saver
        QuoteResponse expressSaver = new QuoteResponse();
        expressSaver.setCarrierName("FedEx");
        expressSaver.setServiceName("FedEx Express Saver");
        expressSaver.setServiceCode("FEDEX_EXPRESS_SAVER");
        expressSaver.setPrice(calculateDemoPrice(request, 1.2));
        expressSaver.setCurrency("USD");
        expressSaver.setEstimatedTransitDays(3);
        expressSaver.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(3));
        quotes.add(expressSaver);
        
        // FedEx 2Day
        QuoteResponse twoDay = new QuoteResponse();
        twoDay.setCarrierName("FedEx");
        twoDay.setServiceName("FedEx 2Day");
        twoDay.setServiceCode("FEDEX_2_DAY");
        twoDay.setPrice(calculateDemoPrice(request, 1.5));
        twoDay.setCurrency("USD");
        twoDay.setEstimatedTransitDays(2);
        twoDay.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(2));
        quotes.add(twoDay);
        
        return quotes;
    }
    
    /**
     * Get UPS quotes (simplified implementation)
     */
    private List<QuoteResponse> getUPSQuotes(QuoteRequest request) {
        // For demo purposes, return mock UPS quotes
        List<QuoteResponse> quotes = new ArrayList<>();
        
        // UPS Ground
        QuoteResponse ground = new QuoteResponse();
        ground.setCarrierName("UPS");
        ground.setServiceName("UPS Ground");
        ground.setServiceCode("03");
        ground.setPrice(calculateDemoPrice(request, 0.9));
        ground.setCurrency("USD");
        ground.setEstimatedTransitDays(5);
        ground.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(5));
        quotes.add(ground);
        
        // UPS 3 Day Select
        QuoteResponse threeDay = new QuoteResponse();
        threeDay.setCarrierName("UPS");
        threeDay.setServiceName("UPS 3 Day Select");
        threeDay.setServiceCode("12");
        threeDay.setPrice(calculateDemoPrice(request, 1.3));
        threeDay.setCurrency("USD");
        threeDay.setEstimatedTransitDays(3);
        threeDay.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(3));
        quotes.add(threeDay);
        
        return quotes;
    }
    
    /**
     * Get DHL quotes (simplified implementation)
     */
    private List<QuoteResponse> getDHLQuotes(QuoteRequest request) {
        List<QuoteResponse> quotes = new ArrayList<>();
        
        // DHL Express
        QuoteResponse express = new QuoteResponse();
        express.setCarrierName("DHL");
        express.setServiceName("DHL Express Worldwide");
        express.setServiceCode("P");
        express.setPrice(calculateDemoPrice(request, 1.8));
        express.setCurrency("USD");
        express.setEstimatedTransitDays(2);
        express.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(2));
        quotes.add(express);
        
        return quotes;
    }
    
    /**
     * Get USPS quotes (simplified implementation)
     */
    private List<QuoteResponse> getUSPSQuotes(QuoteRequest request) {
        List<QuoteResponse> quotes = new ArrayList<>();
        
        // USPS Priority Mail
        QuoteResponse priority = new QuoteResponse();
        priority.setCarrierName("USPS");
        priority.setServiceName("Priority Mail");
        priority.setServiceCode("Priority");
        priority.setPrice(calculateDemoPrice(request, 0.7));
        priority.setCurrency("USD");
        priority.setEstimatedTransitDays(3);
        priority.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(3));
        quotes.add(priority);
        
        return quotes;
    }
    
    /**
     * Calculate demo pricing based on package details
     */
    private BigDecimal calculateDemoPrice(QuoteRequest request, double multiplier) {
        double basePrice = 15.0;
        double weightPrice = request.getWeight() * 2.5;
        double distancePrice = 25.0; // Simplified distance calculation
        
        if (request.getDimensionsLength() != null) {
            double volume = request.getDimensionsLength() * request.getDimensionsWidth() * request.getDimensionsHeight();
            double volumePrice = volume * 0.01;
            basePrice += volumePrice;
        }
        
        double totalPrice = (basePrice + weightPrice + distancePrice) * multiplier;
        return BigDecimal.valueOf(Math.round(totalPrice * 100.0) / 100.0);
    }
    
    /**
     * Get display name for service codes
     */
    private String getServiceDisplayName(String carrier, String serviceCode) {
        Map<String, String> serviceNames = new HashMap<>();
        
        // FedEx service names
        serviceNames.put("FEDEX_GROUND", "FedEx Ground");
        serviceNames.put("FEDEX_EXPRESS_SAVER", "FedEx Express Saver");
        serviceNames.put("FEDEX_2_DAY", "FedEx 2Day");
        serviceNames.put("STANDARD_OVERNIGHT", "FedEx Standard Overnight");
        serviceNames.put("PRIORITY_OVERNIGHT", "FedEx Priority Overnight");
        
        return serviceNames.getOrDefault(serviceCode, serviceCode);
    }
}
