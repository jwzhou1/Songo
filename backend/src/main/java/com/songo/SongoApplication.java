package com.songo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for SonGo Shipping Platform
 * 
 * @author SonGo Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class SongoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SongoApplication.class, args);
        System.out.println("🚚 SonGo Shipping Platform Backend Started Successfully!");
        System.out.println("📖 API Documentation: http://localhost:8080/api/swagger-ui.html");
        System.out.println("🔍 Health Check: http://localhost:8080/api/actuator/health");
    }
}
