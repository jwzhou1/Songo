package com.songo.quote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Quote Service - Microservice for handling shipping quotes
 * Supports both pallet and parcel shipping with real-time carrier rate comparison
 */
@SpringBootApplication
@EnableFeignClients
@EnableAsync
@EnableScheduling
public class QuoteServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuoteServiceApplication.class, args);
    }
}
