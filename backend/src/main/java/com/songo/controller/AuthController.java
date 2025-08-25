package com.songo.controller;

import com.songo.dto.auth.JwtResponse;
import com.songo.dto.auth.LoginRequest;
import com.songo.dto.auth.RegisterRequest;
import com.songo.model.User;
import com.songo.repository.UserRepository;
import com.songo.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Authentication controller for login, register, and JWT operations
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            User userDetails = (User) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails.getEmail(), userDetails.getRole().name(), userDetails.getId());

            // Update last login
            userDetails.setLastLogin(java.time.LocalDateTime.now());
            userRepository.save(userDetails);

            return ResponseEntity.ok(new JwtResponse(jwt, userDetails));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        Map<String, String> response = new HashMap<>();

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            response.put("message", "Email is already in use!");
            return ResponseEntity.badRequest().body(response);
        }

        // Create new user
        User user = new User(
            registerRequest.getEmail(),
            passwordEncoder.encode(registerRequest.getPassword()),
            registerRequest.getFirstName(),
            registerRequest.getLastName()
        );

        if (registerRequest.getPhone() != null && !registerRequest.getPhone().trim().isEmpty()) {
            user.setPhone(registerRequest.getPhone());
        }

        user.setRole(User.Role.CUSTOMER);
        user.setStatus(User.Status.ACTIVE);
        user.setEmailVerified(true); // For now, auto-verify emails

        User savedUser = userRepository.save(user);

        // Generate JWT token for immediate login
        String jwt = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());

        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(new JwtResponse(jwt, savedUser));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        SecurityContextHolder.clearContext();
        Map<String, String> response = new HashMap<>();
        response.put("message", "User logged out successfully!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        User user = (User) authentication.getPrincipal();
        Optional<User> currentUser = userRepository.findById(user.getId());
        
        if (currentUser.isPresent()) {
            return ResponseEntity.ok(currentUser.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String email = jwtUtil.getUsernameFromToken(token);
                
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent() && jwtUtil.validateToken(token)) {
                    User user = userOpt.get();
                    String newToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
                    return ResponseEntity.ok(new JwtResponse(newToken, user));
                }
            }
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Token refresh failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}
