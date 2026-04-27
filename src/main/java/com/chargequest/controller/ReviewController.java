package com.chargequest.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chargequest.dto.ApiResponse;
import com.chargequest.dto.ReviewRequest;
import com.chargequest.dto.ReviewResponseDTO;
import com.chargequest.dto.ReviewUpdateRequest;
import com.chargequest.service.ReviewService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ReviewController {
	
	private final ReviewService reviewService;
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addReview(
            @Valid @RequestBody ReviewRequest request) {

        return ResponseEntity.ok(reviewService.addReview(request));
    }

    @GetMapping("/{stationId}/reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByStation(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByStation(stationId)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByUser(userId)
        );
    }
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReviewResponseDTO> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewUpdateRequest request) {

        return ResponseEntity.ok(
                reviewService.updateReview(reviewId, request)
        );
    }
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse> deleteReview(
            @PathVariable Long reviewId) {

        return ResponseEntity.ok(
                reviewService.deleteReview(reviewId)
        );
    }
}
