package com.chargequest.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import com.chargequest.model.Booking;
import com.chargequest.model.Station;
import com.chargequest.model.User;
import com.chargequest.repository.BookingRepository;
import com.chargequest.repository.StationRepository;
import com.chargequest.repository.UserRepository;
import com.chargequest.tempdto.BookingRequest;
import com.chargequest.tempdto.BookingResponseDTO;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    
    

    @Mock
    private UserRepository userRepository;

    @Mock
    private StationRepository stationRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void shouldCreateBookingSuccessfully() {

        Long userId = 1L;

        // Arrange booking request
        BookingRequest request = new BookingRequest();
        request.setStationId(10L);
        request.setStartTime(LocalDateTime.now());
        request.setEndTime(LocalDateTime.now().plusHours(2));

        // Mock User
        User user = new User();
        user.setUserId(userId);
        user.setEmail("test@example.com");

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        // Mock Station
        Station station = new Station();
        station.setStationId(10L);
        station.setPricePerUnit(100.0);
        station.setAvailableSlots(5);
        station.setStationName("EV Station");
        station.setAddress("Pune");

        when(stationRepository.findById(10L))
                .thenReturn(Optional.of(station));

        // No overlapping booking
        when(bookingRepository.hasOverlappingBooking(
                anyLong(), any(), any()))
                .thenReturn(false);

        // Mock booking entity from modelMapper
        Booking booking = new Booking();
        when(modelMapper.map(any(BookingRequest.class), any()))
                .thenReturn(booking);

        when(bookingRepository.save(any(Booking.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(stationRepository.save(any(Station.class)))
                .thenReturn(station);

        // Act
        BookingResponseDTO response =
                bookingService.createBooking(request, userId);

        // Assert
        assertNotNull(response);
        assertEquals(10L, response.getStationId());
        assertEquals(userId, response.getUserId());

        verify(userRepository).findById(userId);
        verify(stationRepository).findById(10L);
        verify(bookingRepository).save(any(Booking.class));
    }
}
