package com.songo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Address entity for storing shipping and billing addresses
 */
@Entity
@Table(name = "addresses")
public class Address {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AddressType type;
    
    @Size(max = 255)
    @Column(name = "company_name")
    private String companyName;
    
    @NotBlank
    @Size(max = 255)
    @Column(name = "contact_name", nullable = false)
    private String contactName;
    
    @NotBlank
    @Size(max = 255)
    @Column(name = "address_line1", nullable = false)
    private String addressLine1;
    
    @Size(max = 255)
    @Column(name = "address_line2")
    private String addressLine2;
    
    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String city;
    
    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String province;
    
    @NotBlank
    @Size(max = 10)
    @Column(name = "postal_code", nullable = false)
    private String postalCode;
    
    @Size(max = 2)
    private String country = "CA";
    
    @Size(max = 20)
    private String phone;
    
    @Size(max = 255)
    private String email;
    
    @Column(name = "is_default")
    private Boolean isDefault = false;
    
    @Column(name = "is_residential")
    private Boolean isResidential = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum AddressType {
        BILLING, SHIPPING, PICKUP
    }
    
    // Constructors
    public Address() {}
    
    public Address(User user, AddressType type, String contactName, String addressLine1, 
                   String city, String province, String postalCode) {
        this.user = user;
        this.type = type;
        this.contactName = contactName;
        this.addressLine1 = addressLine1;
        this.city = city;
        this.province = province;
        this.postalCode = postalCode;
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public AddressType getType() { return type; }
    public void setType(AddressType type) { this.type = type; }
    
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
    
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
    
    public Boolean getIsResidential() { return isResidential; }
    public void setIsResidential(Boolean isResidential) { this.isResidential = isResidential; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Utility methods
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (companyName != null && !companyName.trim().isEmpty()) {
            sb.append(companyName).append("\n");
        }
        sb.append(contactName).append("\n");
        sb.append(addressLine1);
        if (addressLine2 != null && !addressLine2.trim().isEmpty()) {
            sb.append("\n").append(addressLine2);
        }
        sb.append("\n").append(city).append(", ").append(province).append(" ").append(postalCode);
        sb.append("\n").append(country);
        return sb.toString();
    }
}
