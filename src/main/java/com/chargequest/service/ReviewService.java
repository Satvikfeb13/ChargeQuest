package com.chargequest.service;

import java.util.List;

import com.chargequest.DTO.ApiResponse;
import com.chargequest.DTO.ReviewRequest;
import com.chargequest.DTO.ReviewResponseDTO;
import com.chargequest.DTO.ReviewUpdateRequest;

import jakarta.validation.Valid;

public interface ReviewService {


    ApiResponse addReview(ReviewRequest request);

    List<ReviewResponseDTO> getReviewsByStation(Long stationId);

    List<ReviewResponseDTO> getReviewsByUser(Long userId);

    ApiResponse deleteReview(Long reviewId);
    

	ReviewResponseDTO updateReview(Long reviewId, @Valid ReviewUpdateRequest request);
    


}
