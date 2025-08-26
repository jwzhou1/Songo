package com.songo.quote.model;

import com.amazonaws.services.dynamodbv2.datamodeling.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Enhanced Shipping Quote entity for DynamoDB
 * Supports both pallet and parcel shipping with comprehensive carrier options
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamoDBTable(tableName = "shipping_quotes")
public class ShippingQuote {

    @DynamoDBHashKey
    @DynamoDBAttribute(attributeName = "quote_id")
    private String quoteId;

    @DynamoDBRangeKey
    @DynamoDBAttribute(attributeName = "user_id")
    private String userId;

    @DynamoDBAttribute(attributeName = "quote_number")
    private String quoteNumber;

    // Origin Information
    @DynamoDBAttribute(attributeName = "origin_address")
    private Address originAddress;

    // Destination Information
    @DynamoDBAttribute(attributeName = "destination_address")
    private Address destinationAddress;

    // Shipment Details
    @DynamoDBAttribute(attributeName = "shipment_type")
    @DynamoDBTypeConvertedEnum
    private ShipmentType shipmentType;

    @DynamoDBAttribute(attributeName = "package_details")
    private PackageDetails packageDetails;

    @DynamoDBAttribute(attributeName = "pallet_details")
    private PalletDetails palletDetails;

    // Carrier Quotes
    @DynamoDBAttribute(attributeName = "carrier_quotes")
    private List<CarrierQuote> carrierQuotes;

    @DynamoDBAttribute(attributeName = "selected_carrier")
    private String selectedCarrier;

    // Pricing
    @DynamoDBAttribute(attributeName = "total_cost")
    private BigDecimal totalCost;

    @DynamoDBAttribute(attributeName = "base_cost")
    private BigDecimal baseCost;

    @DynamoDBAttribute(attributeName = "fuel_surcharge")
    private BigDecimal fuelSurcharge;

    @DynamoDBAttribute(attributeName = "additional_fees")
    private Map<String, BigDecimal> additionalFees;

    // Service Details
    @DynamoDBAttribute(attributeName = "service_type")
    private String serviceType; // Standard, Express, Overnight, etc.

    @DynamoDBAttribute(attributeName = "estimated_transit_days")
    private Integer estimatedTransitDays;

    @DynamoDBAttribute(attributeName = "estimated_delivery_date")
    private LocalDateTime estimatedDeliveryDate;

    // Special Services
    @DynamoDBAttribute(attributeName = "special_services")
    private List<String> specialServices; // Insurance, Signature Required, etc.

    @DynamoDBAttribute(attributeName = "insurance_value")
    private BigDecimal insuranceValue;

    // Status and Tracking
    @DynamoDBAttribute(attributeName = "status")
    @DynamoDBTypeConvertedEnum
    private QuoteStatus status;

    @DynamoDBAttribute(attributeName = "valid_until")
    private LocalDateTime validUntil;

    @DynamoDBAttribute(attributeName = "created_at")
    private LocalDateTime createdAt;

    @DynamoDBAttribute(attributeName = "updated_at")
    private LocalDateTime updatedAt;

    @DynamoDBAttribute(attributeName = "expires_at")
    private LocalDateTime expiresAt;

    // Metadata
    @DynamoDBAttribute(attributeName = "quote_source")
    private String quoteSource; // WEB, API, MOBILE

    @DynamoDBAttribute(attributeName = "customer_reference")
    private String customerReference;

    @DynamoDBAttribute(attributeName = "special_instructions")
    private String specialInstructions;

    // Nested Classes
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String contactName;
        private String contactPhone;
        private String contactEmail;
        private boolean isResidential;
        private boolean hasLoadingDock;
        private String accessInstructions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageDetails {
        private Integer packageCount;
        private Double totalWeight;
        private String weightUnit; // LBS, KG
        private List<PackageDimension> packages;
        private String packagingType; // BOX, ENVELOPE, TUBE, etc.
        private boolean isFragile;
        private boolean isHazardous;
        private String commodityDescription;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PalletDetails {
        private Integer palletCount;
        private Double totalWeight;
        private String weightUnit; // LBS, KG
        private List<PalletDimension> pallets;
        private String palletType; // STANDARD, EURO, CUSTOM
        private boolean isStackable;
        private Integer stackHeight;
        private String handlingUnit; // PALLET, SKID, CRATE
        private String commodityClass; // NMFC class for LTL
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageDimension {
        private Double length;
        private Double width;
        private Double height;
        private String unit; // IN, CM
        private Double weight;
        private String weightUnit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PalletDimension {
        private Double length;
        private Double width;
        private Double height;
        private String unit; // IN, CM
        private Double weight;
        private String weightUnit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarrierQuote {
        private String carrierId;
        private String carrierName;
        private String serviceType;
        private BigDecimal totalCost;
        private BigDecimal baseCost;
        private Map<String, BigDecimal> fees;
        private Integer transitDays;
        private LocalDateTime estimatedDelivery;
        private String trackingNumber;
        private boolean isAvailable;
        private String errorMessage;
        private LocalDateTime quotedAt;
    }

    // Enums
    public enum ShipmentType {
        PARCEL,      // Small packages
        LTL,         // Less Than Truckload
        FTL,         // Full Truckload
        PALLET,      // Palletized freight
        EXPEDITED,   // Time-critical shipments
        INTERNATIONAL // Cross-border shipments
    }

    public enum QuoteStatus {
        PENDING,     // Quote request received
        QUOTED,      // Rates retrieved from carriers
        SELECTED,    // Customer selected a carrier
        BOOKED,      // Shipment booked with carrier
        EXPIRED,     // Quote expired
        CANCELLED    // Quote cancelled
    }

    // Lifecycle methods
    @DynamoDBAutoGeneratedKey
    public String getQuoteId() {
        return quoteId;
    }

    @DynamoDBVersionAttribute
    private Long version;

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
        // Set expiration to 7 days from creation
        this.expiresAt = createdAt.plusDays(7);
        this.validUntil = createdAt.plusDays(7);
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
