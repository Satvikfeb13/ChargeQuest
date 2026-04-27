package com.chargequest.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chargequest.customException.BookingException;
import com.chargequest.customException.ResourceNotFoundException;
import com.chargequest.dto.BookingRequest;
import com.chargequest.dto.BookingResponseDTO;
import com.chargequest.model.Booking;
import com.chargequest.model.BookingStatus;
import com.chargequest.model.PaymentStatus;
import com.chargequest.model.Station;
import com.chargequest.model.User;
import com.chargequest.repository.BookingRepository;
import com.chargequest.repository.StationRepository;
import com.chargequest.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final StationRepository stationRepository;
    private final ModelMapper modelMapper;

    @Override
    public BookingResponseDTO createBooking(BookingRequest request, Long userId) {

        log.info("Creating booking for user: {} at station: {}", userId, request.getStationId());

        // ✅ Find user - Will throw ResourceNotFoundException if not found
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found. User ID: {}", userId);
                    return new ResourceNotFoundException("User not found");
                });

        // ✅ Find station - Will throw ResourceNotFoundException if not found
        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> {
                    log.error("Station not found. Station ID: {}", request.getStationId());
                    return new ResourceNotFoundException("Station not found");
                });

        // ✅ Validate times
        if (request.getStartTime().isAfter(request.getEndTime())) {
            log.error("Invalid booking times. Start time: {}, End time: {}", 
                    request.getStartTime(), request.getEndTime());
            throw new BookingException("Start time must be before end time");
        }

        // ✅ Check for overlapping bookings
        if (bookingRepository.hasOverlappingBooking(
                request.getStationId(),
                request.getStartTime(),
                request.getEndTime())) {
            log.error("Overlapping booking found for station: {} between {} and {}", 
                    request.getStationId(), request.getStartTime(), request.getEndTime());
            throw new BookingException("Time slot already booked at this station");
        }

        // ✅ Check available slots
        if (station.getAvailableSlots() <= 0) {
            log.error("No available slots at station: {}", request.getStationId());
            throw new BookingException("No available slots at this station");
        }

        // ✅ Calculate total amount
        long durationHours = java.time.temporal.ChronoUnit.HOURS
                .between(request.getStartTime(), request.getEndTime());
        if (durationHours <= 0) {
            durationHours = 1; // Minimum 1 hour
        }
        Double totalAmount = durationHours * station.getPricePerUnit();

        log.info("Booking details - Duration: {} hours, Price per unit: {}, Total amount: {}", 
                durationHours, station.getPricePerUnit(), totalAmount);

        // ✅ Create booking
        Booking booking = modelMapper.map(request, Booking.class);
        booking.setUser(user);
        booking.setStation(station);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        booking.setPaymentStatus(PaymentStatus.NOT_PAID);
        booking.setTotalAmount(totalAmount);

        // ✅ Update station available slots
        station.setAvailableSlots(station.getAvailableSlots() - 1);
        stationRepository.save(station);

        // ✅ Save booking
        Booking savedBooking = bookingRepository.save(booking);

        log.info("Booking created successfully. Booking ID: {}, User ID: {}, Station ID: {}", 
                savedBooking.getBookingId(), userId, request.getStationId());

        return mapToDTO(savedBooking);
    }

    @Override
    public BookingResponseDTO getBookingById(Long bookingId, Long userId) {

        log.info("Fetching booking: {} for user: {}", bookingId, userId);

        // ✅ Will throw ResourceNotFoundException if not found
        Booking booking = bookingRepository
                .findByBookingIdAndUser_UserId(bookingId, userId)
                .orElseThrow(() -> {
                    log.error("Booking not found or access denied. Booking ID: {}, User ID: {}", 
                            bookingId, userId);
                    return new ResourceNotFoundException("Booking not found or access denied");
                });

        return mapToDTO(booking);
    }

    @Transactional(readOnly = true)
    @Override
    public List<BookingResponseDTO> getBookingsByUser(Long userId) {

        log.info("Fetching all bookings for user: {}", userId);

        List<BookingResponseDTO> bookings = bookingRepository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToDTO)
                .toList();

        log.info("Found {} bookings for user: {}", bookings.size(), userId);

        return bookings;
    }

    @Override
    public BookingResponseDTO cancelBooking(Long bookingId, Long userId) {

        log.info("Cancelling booking: {} for user: {}", bookingId, userId);

        // ✅ Find booking
        Booking booking = bookingRepository
                .findByBookingIdAndUser_UserId(bookingId, userId)
                .orElseThrow(() -> {
                    log.error("Booking not found or access denied. Booking ID: {}, User ID: {}", 
                            bookingId, userId);
                    return new ResourceNotFoundException("Booking not found or access denied");
                });

        // ✅ Validate booking status
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            log.error("Booking already cancelled. Booking ID: {}", bookingId);
            throw new BookingException("Booking is already cancelled");
        }

        // ✅ Update payment status if already paid
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
            log.info("Refund initiated for booking: {}", bookingId);
        }

        // ✅ Cancel booking
        booking.setBookingStatus(BookingStatus.CANCELLED);

        // ✅ Release station slot
        Station station = booking.getStation();
        station.setAvailableSlots(station.getAvailableSlots() + 1);

        stationRepository.save(station);
        Booking cancelledBooking = bookingRepository.save(booking);

        log.info("Booking cancelled successfully. Booking ID: {}", bookingId);

        return mapToDTO(cancelledBooking);
    }

    public List<BookingResponseDTO> getAllBookings() {

        log.info("Fetching all bookings");

        List<BookingResponseDTO> bookings = bookingRepository.findAll()
                .stream()
                .map(b -> {
                    BookingResponseDTO dto = new BookingResponseDTO();

                    dto.setBookingId(b.getBookingId());
                    dto.setStartTime(b.getStartTime());
                    dto.setEndTime(b.getEndTime());
                    dto.setTotalAmount(b.getTotalAmount());
                    dto.setCreatedAt(b.getCreatedAt());

                    if (b.getBookingStatus() != null) {
                        dto.setStatus(b.getBookingStatus().name());
                    }

                    if (b.getUser() != null) {
                        dto.setUserId(b.getUser().getUserId());
                        dto.setUserEmail(b.getUser().getEmail());
                    }

                    if (b.getStation() != null) {
                        dto.setStationId(b.getStation().getStationId());
                        dto.setStationName(b.getStation().getStationName());
                        dto.setStationAddress(b.getStation().getAddress());
                    }

                    return dto;
                })
                .toList();

        log.info("Found {} total bookings", bookings.size());

        return bookings;
    }

    private BookingResponseDTO mapToDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();

        dto.setBookingId(booking.getBookingId());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setCreatedAt(booking.getCreatedAt());

        // ✅ Null checks to prevent NullPointerException
        if (booking.getBookingStatus() != null) {
            dto.setStatus(booking.getBookingStatus().name());
        }

        if (booking.getUser() != null) {
            dto.setUserId(booking.getUser().getUserId());
            dto.setUserEmail(booking.getUser().getEmail());
        }

        if (booking.getStation() != null) {
            dto.setStationId(booking.getStation().getStationId());
            dto.setStationName(booking.getStation().getStationName());
            dto.setStationAddress(booking.getStation().getAddress());
        }

        return dto;
    }
}