package com.chargequest.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chargequest.DTO.ApiResponse;
import com.chargequest.DTO.OrderResponseDTO;
import com.chargequest.DTO.PaymentResponseDTO;
import com.chargequest.service.PaymentService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/payment")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class PaymentController {

	private final PaymentService paymentService;

    @PostMapping("/order")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderResponseDTO> createOrder(
            @RequestBody Map<String, Long> payload) throws Exception {

        Long bookingId = payload.get("bookingId");
        return ResponseEntity.ok(paymentService.createOrder(bookingId));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse> verifyPayment(
            @RequestBody Map<String, Object> payload) throws Exception {

        return ResponseEntity.ok(paymentService.verifyPayment(payload));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PaymentResponseDTO>> getPayments(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByBooking(bookingId)
        );
    }
}

