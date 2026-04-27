package com.chargequest.service;

import java.util.List;

import com.chargequest.dto.ApiResponse;
import com.chargequest.dto.ReviewRequest;
import com.chargequest.dto.ReviewResponseDTO;
import com.chargequest.dto.ReviewUpdateRequest;

import jakarta.validation.Valid;

public interface ReviewService {


    ApiResponse addReview(ReviewRequest request);

    List<ReviewResponseDTO> getReviewsByStation(Long stationId);

    List<ReviewResponseDTO> getReviewsByUser(Long userId);

    ApiResponse deleteReview(Long reviewId);
    

	ReviewResponseDTO updateReview(Long reviewId, @Valid ReviewUpdateRequest request);
    


}
