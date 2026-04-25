package com.chargequest.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {
    // @Value("${razorpay.key.id}")
    private String keyId;

    // @Value("${razorpay.key.secret}")
    private String keySecret;
}
