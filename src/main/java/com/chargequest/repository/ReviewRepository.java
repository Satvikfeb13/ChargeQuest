package com.chargequest.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chargequest.model.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // One review per booking
    boolean existsByBookingBookingId(Long bookingId);

    // Get reviews by station
    List<Review> findByStationStationId(Long stationId);

    // Get reviews by user
    List<Review> findByUserUserId(Long userId);

}
