package com.chargequest.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chargequest.customException.PaymentException;
import com.chargequest.customException.ResourceNotFoundException;
import com.chargequest.dto.ApiResponse;
import com.chargequest.dto.OrderResponseDTO;
import com.chargequest.dto.PaymentResponseDTO;
import com.chargequest.dto.ResponseStatus;
import com.chargequest.model.Booking;
import com.chargequest.model.BookingStatus;
import com.chargequest.model.Payment;
import com.chargequest.model.PaymentMethod;
import com.chargequest.model.PaymentStatus;
import com.chargequest.repository.BookingRepository;
import com.chargequest.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final ModelMapper modelMapper;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    public OrderResponseDTO createOrder(Long bookingId) throws Exception {

        log.info("=== SERVICE: CREATE ORDER START ===");
        log.info("BookingId: {}", bookingId);

        // 1️⃣ Fetch booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        log.info("Booking found: {}", bookingId);
        log.info("Total amount validated: {}", booking.getTotalAmount());

        // 2️⃣ Convert amount to paise
        int amountInPaise = booking.getTotalAmount().intValue() * 100;

        // 3️⃣ Create Razorpay client
        RazorpayClient client = new RazorpayClient(
                razorpayKeyId,
                razorpayKeySecret
        );

        // 4️⃣ Prepare order request
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "booking_" + bookingId);

        log.info("Calling Razorpay API to create order...");

        // 5️⃣ Create order
        Order order = client.orders.create(orderRequest);

        log.info("Razorpay Order created successfully!");
        log.info("=== SERVICE: CREATE ORDER END ===");
        OrderResponseDTO response = new OrderResponseDTO();
        response.setId(order.get("id"));
        response.setAmount(order.get("amount"));
        response.setCurrency(order.get("currency"));
        response.setReceipt(order.get("receipt"));
        response.setKeyId(razorpayKeyId); 

        return response;
    }


    // ✅ VERIFY PAYMENT - NO CHANGES NEEDED
    @Override
    public ApiResponse verifyPayment(Map<String, Object> payload) throws Exception {

        Object orderIdObj = payload.get("razorpay_order_id");
        Object paymentIdObj = payload.get("razorpay_payment_id");
        Object signatureObj = payload.get("razorpay_signature");
        Object bookingIdObj = payload.get("bookingId") != null
                ? payload.get("bookingId")
                : payload.get("booking_id");

        if (orderIdObj == null || paymentIdObj == null || signatureObj == null || bookingIdObj == null) {
            throw new PaymentException("Missing payment verification fields");
        }

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", orderIdObj.toString());
        options.put("razorpay_payment_id", paymentIdObj.toString());
        options.put("razorpay_signature", signatureObj.toString());

        boolean valid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
        if (!valid) {
            throw new PaymentException("Payment verification failed");
        }

        Long bookingId = Long.parseLong(bookingIdObj.toString());

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setUser(booking.getUser());
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentMethod(PaymentMethod.UPI);
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setPaymentGateway("Razorpay");
        payment.setTransactionId(paymentIdObj.toString());

        paymentRepository.save(payment);

        return new ApiResponse("Payment verified successfully", ResponseStatus.SUCCESS);
    }

    @Override
    public List<PaymentResponseDTO> getPaymentsByBooking(Long bookingId) {
        return paymentRepository.findByBookingBookingId(bookingId)
                .stream()
                .map(payment -> {
                    PaymentResponseDTO dto =
                            modelMapper.map(payment, PaymentResponseDTO.class);
                    dto.setBookingId(payment.getBooking().getBookingId());
                    dto.setStatus(payment.getPaymentStatus().name());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}