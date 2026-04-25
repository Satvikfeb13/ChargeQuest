package com.chargequest.DTO;

import com.chargequest.model.PaymentMethod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {

   
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private Double amount;

    @NotNull(message = "Payment method is required")
    private  PaymentMethod paymentMethod;   // UPI / CARD / NETBANKING
    @NotBlank(message = "Payment gateway is required")

    private String paymentGateway;  // Razorpay / Stripe / PayPal
}
