package com.chargequest.service;

import java.util.List;
import java.util.Map;

import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.OrderResponseDTO;
import com.chargequest.tempdto.PaymentResponseDTO;
import com.razorpay.Order;

public interface PaymentService {


	  OrderResponseDTO createOrder(Long bookingId) throws Exception;

	    ApiResponse verifyPayment(Map<String, Object> payload) throws Exception;

	    List<PaymentResponseDTO> getPaymentsByBooking(Long bookingId);
}
