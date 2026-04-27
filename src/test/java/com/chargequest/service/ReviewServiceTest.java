package com.chargequest.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import com.chargequest.model.Review;
import com.chargequest.model.Station;
import com.chargequest.model.User;
import com.chargequest.repository.ReviewRepository;
import com.chargequest.tempdto.ReviewResponseDTO;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ModelMapper modelMapper;
    
    

    @InjectMocks
    private ReviewServiceImple reviewService;

    @Test
    void shouldReturnReviewsByStation() {

        Long stationId = 1L;

        // Create dummy station
        Station station = new Station();
        station.setStationId(stationId);

        // Create dummy user
        User user = new User();
        user.setUserId(100L);

        // Review 1
        Review review1 = new Review();
        review1.setStation(station);
        review1.setUser(user);

        // Review 2
        Review review2 = new Review();
        review2.setStation(station);
        review2.setUser(user);

        List<Review> reviewList = List.of(review1, review2);

        when(reviewRepository.findByStationStationId(stationId))
                .thenReturn(reviewList);

        when(modelMapper.map(any(Review.class), eq(ReviewResponseDTO.class)))
                .thenReturn(new ReviewResponseDTO());

        List<ReviewResponseDTO> result =
                reviewService.getReviewsByStation(stationId);

        assertEquals(2, result.size());

        verify(reviewRepository)
                .findByStationStationId(stationId);
    }


}
