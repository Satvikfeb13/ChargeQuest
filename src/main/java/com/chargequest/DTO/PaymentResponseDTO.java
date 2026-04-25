package com.chargequest.DTO;



import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentResponseDTO {

    private Long paymentId;
    private Long bookingId;
    private Double amount;
    private String status;
    private String paymentMethod;
}
