package com.chargequest.DTO;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingResponseDTO {
	 
    private Long bookingId;
    private Long userId;
    private String userEmail;
    private Long stationId;
    private String stationName;
    private String stationAddress;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Double totalAmount;
    private LocalDateTime createdAt;
}
