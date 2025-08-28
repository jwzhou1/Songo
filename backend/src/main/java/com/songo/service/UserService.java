package com.songo.service;

import com.songo.model.User;
import com.songo.model.CustomerProfile;
import com.songo.model.Address;
import com.songo.repository.UserRepository;
import com.songo.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing user accounts and profiles
 */
@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a new user account
     */
    public User createUser(String email, String password, String firstName, String lastName, String phone) {
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with email " + email + " already exists");
        }

        User user = new User(email, passwordEncoder.encode(password), firstName, lastName);
        if (phone != null && !phone.trim().isEmpty()) {
            user.setPhone(phone);
        }
        
        user.setRole(User.Role.CUSTOMER);
        user.setStatus(User.Status.ACTIVE);
        user.setEmailVerified(true);

        return userRepository.save(user);
    }

    /**
     * Update user profile information
     */
    public User updateUserProfile(Long userId, String firstName, String lastName, String phone) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (firstName != null && !firstName.trim().isEmpty()) {
            user.setFirstName(firstName);
        }
        if (lastName != null && !lastName.trim().isEmpty()) {
            user.setLastName(lastName);
        }
        if (phone != null) {
            user.setPhone(phone.trim().isEmpty() ? null : phone);
        }

        return userRepository.save(user);
    }

    /**
     * Update user password
     */
    public void updatePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Deactivate user account
     */
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(User.Status.INACTIVE);
        userRepository.save(user);
    }

    /**
     * Reactivate user account
     */
    public User reactivateUser(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != User.Status.INACTIVE) {
            throw new RuntimeException("User account is not inactive");
        }

        user.setStatus(User.Status.ACTIVE);
        user.setEmailVerified(true);
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        return userRepository.save(user);
    }

    /**
     * Update last login time
     */
    public void updateLastLogin(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Get user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get user by ID
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Get user's addresses
     */
    public List<Address> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
    }

    /**
     * Add address to user
     */
    public Address addUserAddress(Long userId, Address address) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        address.setUser(user);
        
        // If this is the first address or marked as default, make it default
        List<Address> existingAddresses = getUserAddresses(userId);
        if (existingAddresses.isEmpty() || address.getIsDefault()) {
            // Set all other addresses as non-default
            existingAddresses.forEach(addr -> {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            });
            address.setIsDefault(true);
        }

        return addressRepository.save(address);
    }

    /**
     * Update user address
     */
    public Address updateUserAddress(Long userId, Long addressId, Address updatedAddress) {
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to user");
        }

        // Update address fields
        address.setType(updatedAddress.getType());
        address.setCompanyName(updatedAddress.getCompanyName());
        address.setContactName(updatedAddress.getContactName());
        address.setAddressLine1(updatedAddress.getAddressLine1());
        address.setAddressLine2(updatedAddress.getAddressLine2());
        address.setCity(updatedAddress.getCity());
        address.setProvince(updatedAddress.getProvince());
        address.setPostalCode(updatedAddress.getPostalCode());
        address.setCountry(updatedAddress.getCountry());
        address.setPhone(updatedAddress.getPhone());
        address.setEmail(updatedAddress.getEmail());
        address.setIsResidential(updatedAddress.getIsResidential());

        // Handle default address
        if (updatedAddress.getIsDefault() && !address.getIsDefault()) {
            // Set all other addresses as non-default
            List<Address> userAddresses = getUserAddresses(userId);
            userAddresses.forEach(addr -> {
                if (!addr.getId().equals(addressId)) {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                }
            });
            address.setIsDefault(true);
        }

        return addressRepository.save(address);
    }

    /**
     * Delete user address
     */
    public void deleteUserAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to user");
        }

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        // If deleted address was default, make another address default
        if (wasDefault) {
            List<Address> remainingAddresses = getUserAddresses(userId);
            if (!remainingAddresses.isEmpty()) {
                Address newDefault = remainingAddresses.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    /**
     * Get user statistics
     */
    public UserStats getUserStats(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        UserStats stats = new UserStats();
        stats.setTotalShipments(user.getShipments() != null ? user.getShipments().size() : 0);
        stats.setTotalAddresses(getUserAddresses(userId).size());
        stats.setAccountCreated(user.getCreatedAt());
        stats.setLastLogin(user.getLastLogin());
        stats.setEmailVerified(user.getEmailVerified());
        stats.setAccountStatus(user.getStatus().name());

        return stats;
    }

    /**
     * Inner class for user statistics
     */
    public static class UserStats {
        private int totalShipments;
        private int totalAddresses;
        private LocalDateTime accountCreated;
        private LocalDateTime lastLogin;
        private Boolean emailVerified;
        private String accountStatus;

        // Getters and setters
        public int getTotalShipments() { return totalShipments; }
        public void setTotalShipments(int totalShipments) { this.totalShipments = totalShipments; }

        public int getTotalAddresses() { return totalAddresses; }
        public void setTotalAddresses(int totalAddresses) { this.totalAddresses = totalAddresses; }

        public LocalDateTime getAccountCreated() { return accountCreated; }
        public void setAccountCreated(LocalDateTime accountCreated) { this.accountCreated = accountCreated; }

        public LocalDateTime getLastLogin() { return lastLogin; }
        public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

        public Boolean getEmailVerified() { return emailVerified; }
        public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

        public String getAccountStatus() { return accountStatus; }
        public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    }
}
