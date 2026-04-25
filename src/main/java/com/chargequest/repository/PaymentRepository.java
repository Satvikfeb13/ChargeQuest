package com.chargequest.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.chargequest.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingBookingId(Long bookingId);
    @Query("""
    	    SELECT p
    	    FROM Payment p
    	    WHERE p.booking.bookingId = :bookingId
    	    ORDER BY p.createdAt DESC
    	""")
    	List<Payment> findLatestPaymentsByBookingId(@Param("bookingId") Long bookingId);


}
