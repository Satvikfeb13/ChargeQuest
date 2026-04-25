package com.chargequest.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;


public class RazorpayService {
    @Value("${razorpay.api.key}")
    private String apiKey;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    public String createOrder(int amount, String currency, String receiptId) throws Exception {

        RazorpayClient razorpayClient = new RazorpayClient(apiKey, apiSecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount * 100); // paise
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", receiptId);

        Order order = razorpayClient.orders.create(orderRequest);

        return order.toString();
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, apiSecret);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}
