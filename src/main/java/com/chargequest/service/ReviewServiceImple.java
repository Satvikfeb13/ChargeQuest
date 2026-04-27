package com.chargequest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chargequest.config.UserPrincipal;
import com.chargequest.customException.ResourceNotFoundException;
import com.chargequest.model.Booking;
import com.chargequest.model.PaymentStatus;
import com.chargequest.model.Review;
import com.chargequest.model.Station;
import com.chargequest.model.User;
import com.chargequest.repository.BookingRepository;
import com.chargequest.repository.ReviewRepository;
import com.chargequest.repository.StationRepository;
import com.chargequest.repository.UserRepository;
import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.ResponseStatus;
import com.chargequest.tempdto.ReviewRequest;
import com.chargequest.tempdto.ReviewResponseDTO;
import com.chargequest.tempdto.ReviewUpdateRequest;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ReviewServiceImple implements ReviewService {
	   private final ReviewRepository reviewRepository;
	    private final BookingRepository bookingRepositary;
	    private final StationRepository stationRepository;
	    private final UserRepository userRepository;
	    private final ModelMapper modelMapper;

	    @Override
	    public ApiResponse addReview(ReviewRequest request) {

	        Booking booking = bookingRepositary.findById(request.getBookingId())
	                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

	        if (booking.getPaymentStatus() != PaymentStatus.PAID) {
	            return new ApiResponse(
	                    "Review allowed only after successful payment",
	                    ResponseStatus.FAILED
	            );
	        }
	        UserPrincipal principal =
	        	    (UserPrincipal) SecurityContextHolder.getContext()
	        	        .getAuthentication().getPrincipal();

	        	Long userId = principal.getUserId();

	        User user = userRepository.findById(userId)
	                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

	        Station station = stationRepository.findById(request.getStationId())
	                .orElseThrow(() -> new ResourceNotFoundException("Station not found"));

	        if (reviewRepository.existsByBookingBookingId(request.getBookingId())) {
	            return new ApiResponse(
	                    "Review already submitted for this booking",
	                    ResponseStatus.FAILED
	            );
	        }

	        Review review = new Review();
	        review.setUser(user);
	        review.setStation(station);
	        review.setBooking(booking);
	        review.setRating(request.getRating());
	        review.setComment(request.getComment());

	        reviewRepository.save(review);

	        return new ApiResponse(
	                "Review added successfully",
	                ResponseStatus.SUCCESS
	        );
	    }

	    @Override
	    public List<ReviewResponseDTO> getReviewsByStation(Long stationId) {

	        return reviewRepository.findByStationStationId(stationId)
	                .stream()
	                .map(review -> {
	                    ReviewResponseDTO dto =
	                            modelMapper.map(review, ReviewResponseDTO.class);
	                    dto.setUserId(review.getUser().getUserId());
	                    dto.setEmail(review.getUser().getEmail());
	                    dto.setStationId(review.getStation().getStationId());
	                    dto.setStationName(review.getStation().getStationName());
	                    return dto;
	                })
	                .collect(Collectors.toList());
	    }


	    @Override
	    public List<ReviewResponseDTO> getReviewsByUser(Long userId) {

	        return reviewRepository.findByUserUserId(userId)
	                .stream()
	                .map(review -> {

	                    ReviewResponseDTO dto =
	                            modelMapper.map(review, ReviewResponseDTO.class);

	                   
	                    dto.setUserId(review.getUser().getUserId());
	                    dto.setEmail(review.getUser().getEmail());
	                    dto.setStationId(review.getStation().getStationId());
	                    dto.setStationName(review.getStation().getStationName());

	                    return dto;
	                })
	                .collect(Collectors.toList());
	    }


	    @Override
	    public ApiResponse deleteReview(Long reviewId) {

	        Review review = reviewRepository.findById(reviewId)
	                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

	        reviewRepository.delete(review);

	        return new ApiResponse(
	                "Review deleted successfully",
	                ResponseStatus.SUCCESS
	        );
	    }

	    @Override
	    @Transactional
	    public ReviewResponseDTO updateReview(Long reviewId, ReviewUpdateRequest  request) {

	        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
	        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
	        Long loggedInUserId = Long.valueOf(principal.getUserId());

	        Review review = reviewRepository.findById(reviewId)
	                .orElseThrow(() -> new RuntimeException("Review not found"));

	        if (!review.getUser().getUserId().equals(loggedInUserId)) {
	            throw new RuntimeException("You are not allowed to update this review");
	        }

	        review.setRating(request.getRating());
	        review.setComment(request.getComment());
	        Review updatedReview = reviewRepository.save(review);

	        return mapToResponseDTO(updatedReview);
	    }

	    private ReviewResponseDTO mapToResponseDTO(Review review) {
	        ReviewResponseDTO dto = new ReviewResponseDTO();

	        dto.setReviewId(review.getReviewId());
	        dto.setRating(review.getRating());
	        dto.setComment(review.getComment());
	        dto.setCreatedAt(review.getCreatedAt());

	        dto.setUserId(review.getUser().getUserId());
	        dto.setEmail(review.getUser().getEmail());

	        dto.setStationId(review.getStation().getStationId());
	        dto.setStationName(review.getStation().getStationName());

	        return dto;
	    }

}
