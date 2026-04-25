package com.chargequest.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.chargequest.model.Booking;
import com.chargequest.model.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // 1️ Get all bookings of a specific user
    List<Booking> findByUser_UserId(Long userId);

    // 2️ Check duplicate booking
    @Query("""
        SELECT COUNT(b) > 0
        FROM Booking b
        WHERE b.user.userId = :userId
          AND b.station.stationId = :stationId
          AND b.startTime = :startTime
          AND b.bookingStatus = 'CONFIRMED'
    """)
    boolean isDuplicateBooking(
            @Param("userId") Long userId,
            @Param("stationId") Long stationId,
            @Param("startTime") LocalDateTime startTime
    );

    // 3️ Check overlapping booking for station
    @Query("""
        SELECT COUNT(b) > 0
        FROM Booking b
        WHERE b.station.stationId = :stationId
          AND b.bookingStatus = 'CONFIRMED'
          AND b.startTime < :endTime
          AND b.endTime > :startTime
    """)
    boolean hasOverlappingBooking(
            @Param("stationId") Long stationId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
    @Query("""
    	    SELECT b FROM Booking b
    	    JOIN FETCH b.user
    	    JOIN FETCH b.station
    	""")
    	List<Booking> findAllBookingsWithUserAndStation();
    // 4️ Get bookings by status
    List<Booking> findByBookingStatus(BookingStatus status);

    // 5️ Ownership-based booking fetch (SECURITY CRITICAL)
    Optional<Booking> findByBookingIdAndUser_UserId(Long bookingId, Long userId);
    
    List<Booking> findByEndTimeBeforeAndBookingStatus(
            LocalDateTime time,
            BookingStatus bookingStatus);
    default  void print() {
    	System.out.println("Hell0");
    }

}
