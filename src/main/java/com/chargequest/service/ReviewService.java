package com.chargequest.service;

import java.util.List;

import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.ReviewRequest;
import com.chargequest.tempdto.ReviewResponseDTO;
import com.chargequest.tempdto.ReviewUpdateRequest;

import jakarta.validation.Valid;

public interface ReviewService {


    ApiResponse addReview(ReviewRequest request);

    List<ReviewResponseDTO> getReviewsByStation(Long stationId);

    List<ReviewResponseDTO> getReviewsByUser(Long userId);

    ApiResponse deleteReview(Long reviewId);
    

	ReviewResponseDTO updateReview(Long reviewId, @Valid ReviewUpdateRequest request);
    


}
