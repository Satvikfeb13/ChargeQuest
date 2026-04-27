package com.chargequest.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chargequest.config.UserPrincipal;
import com.chargequest.customException.ResourceNotFoundException;
import com.chargequest.service.BookingService;
import com.chargequest.tempdto.BookingRequest;
import com.chargequest.tempdto.BookingResponseDTO;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;
    // Create booking
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(
                bookingService.createBooking(request, Long.valueOf(user.getUserId()))
        );
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal user
    ) {
        return ResponseEntity.ok(
                bookingService.getBookingsByUser(user.getUserId())
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(
                bookingService.getBookingById(id, Long.valueOf(user.getUserId()))
        );
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByUserId(
            @PathVariable Long userId,
            Authentication authentication) {
        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();
        
        // Security check: users can only fetch their own bookings, but admins can fetch any
        if (!user.getUserId().equals(userId) && !authentication.getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new ResourceNotFoundException("Access denied - you can only view your own bookings");
        }
        
        return ResponseEntity.ok(
                bookingService.getBookingsByUser(userId)
        );
    }

    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(
                bookingService.cancelBooking(id, Long.valueOf(user.getUserId()))
        );
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }
}