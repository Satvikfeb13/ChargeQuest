package com.chargequest.schedular;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.chargequest.model.Booking;
import com.chargequest.model.BookingStatus;
import com.chargequest.repository.BookingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class BookingScheduler {
    private final  BookingRepository bookingRepository;

    @Scheduled(cron = "0 * * * * *") // runs every minute
    public void cancelExpiredBookings() {

    
        log.info("Running scheduler...");
        

        List<Booking> expiredBookings =
                bookingRepository.findByEndTimeBeforeAndBookingStatus(
                        LocalDateTime.now(),
                        BookingStatus.CONFIRMED);

        for (Booking booking : expiredBookings) {
            booking.setBookingStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
        }

    }
}
