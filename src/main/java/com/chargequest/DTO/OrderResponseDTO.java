package com.chargequest.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private String id;           // Razorpay order ID
    private String currency;     // INR
    private Integer amount;      // Amount in paise
    private String receipt;      // Our booking reference
    private String keyId;   

}