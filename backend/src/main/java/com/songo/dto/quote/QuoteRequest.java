package com.songo.dto.quote;

import com.songo.model.Quote;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Quote request DTO for creating new quotes
 */
public class QuoteRequest {
    
    // Origin details
    @NotBlank(message = "Origin address is required")
    private String originAddress;
    
    @NotBlank(message = "Origin city is required")
    private String originCity;
    
    @NotBlank(message = "Origin state is required")
    private String originState;
    
    @NotBlank(message = "Origin zip code is required")
    private String originZip;
    
    @NotBlank(message = "Origin country is required")
    private String originCountry;
    
    // Destination details
    @NotBlank(message = "Destination address is required")
    private String destinationAddress;
    
    @NotBlank(message = "Destination city is required")
    private String destinationCity;
    
    @NotBlank(message = "Destination state is required")
    private String destinationState;
    
    @NotBlank(message = "Destination zip code is required")
    private String destinationZip;
    
    @NotBlank(message = "Destination country is required")
    private String destinationCountry;
    
    // Shipment details
    @NotNull(message = "Shipment type is required")
    private Quote.ShipmentType shipmentType;
    
    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weight;
    
    private String weightUnit = "lbs";
    
    private Double dimensionsLength;
    private Double dimensionsWidth;
    private Double dimensionsHeight;
    private String dimensionsUnit = "in";
    
    private Integer packageCount = 1;
    private String cargoDescription;
    private BigDecimal cargoValue;
    private String specialInstructions;
    
    // Constructors
    public QuoteRequest() {}
    
    // Getters and Setters
    public String getOriginAddress() { return originAddress; }
    public void setOriginAddress(String originAddress) { this.originAddress = originAddress; }
    
    public String getOriginCity() { return originCity; }
    public void setOriginCity(String originCity) { this.originCity = originCity; }
    
    public String getOriginState() { return originState; }
    public void setOriginState(String originState) { this.originState = originState; }
    
    public String getOriginZip() { return originZip; }
    public void setOriginZip(String originZip) { this.originZip = originZip; }
    
    public String getOriginCountry() { return originCountry; }
    public void setOriginCountry(String originCountry) { this.originCountry = originCountry; }
    
    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }
    
    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }
    
    public String getDestinationState() { return destinationState; }
    public void setDestinationState(String destinationState) { this.destinationState = destinationState; }
    
    public String getDestinationZip() { return destinationZip; }
    public void setDestinationZip(String destinationZip) { this.destinationZip = destinationZip; }
    
    public String getDestinationCountry() { return destinationCountry; }
    public void setDestinationCountry(String destinationCountry) { this.destinationCountry = destinationCountry; }
    
    public Quote.ShipmentType getShipmentType() { return shipmentType; }
    public void setShipmentType(Quote.ShipmentType shipmentType) { this.shipmentType = shipmentType; }
    
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    
    public String getWeightUnit() { return weightUnit; }
    public void setWeightUnit(String weightUnit) { this.weightUnit = weightUnit; }
    
    public Double getDimensionsLength() { return dimensionsLength; }
    public void setDimensionsLength(Double dimensionsLength) { this.dimensionsLength = dimensionsLength; }
    
    public Double getDimensionsWidth() { return dimensionsWidth; }
    public void setDimensionsWidth(Double dimensionsWidth) { this.dimensionsWidth = dimensionsWidth; }
    
    public Double getDimensionsHeight() { return dimensionsHeight; }
    public void setDimensionsHeight(Double dimensionsHeight) { this.dimensionsHeight = dimensionsHeight; }
    
    public String getDimensionsUnit() { return dimensionsUnit; }
    public void setDimensionsUnit(String dimensionsUnit) { this.dimensionsUnit = dimensionsUnit; }
    
    public Integer getPackageCount() { return packageCount; }
    public void setPackageCount(Integer packageCount) { this.packageCount = packageCount; }
    
    public String getCargoDescription() { return cargoDescription; }
    public void setCargoDescription(String cargoDescription) { this.cargoDescription = cargoDescription; }
    
    public BigDecimal getCargoValue() { return cargoValue; }
    public void setCargoValue(BigDecimal cargoValue) { this.cargoValue = cargoValue; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
}
