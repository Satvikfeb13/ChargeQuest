package com.chargequest.service;

import java.util.List;

import com.chargequest.DTO.BookingRequest;
import com.chargequest.DTO.BookingResponseDTO;

public interface BookingService {

    BookingResponseDTO createBooking(BookingRequest request, Long userId);

    BookingResponseDTO getBookingById(Long bookingId, Long userId);

    List<BookingResponseDTO> getBookingsByUser(Long userId);

    BookingResponseDTO cancelBooking(Long bookingId, Long userId);

    List<BookingResponseDTO> getAllBookings();
}
