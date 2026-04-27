package com.chargequest.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingRequest {
    @NotNull(message = "Station id cannot be null")
    private Long stationId;

    @NotNull(message = "Start time is required")
    @FutureOrPresent(message = "Start time must be present or future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in future")
    private LocalDateTime endTime;

    @NotBlank(message = "Connector type is required")
    private String connectorTypeNeeded;

    @NotNull(message = "Estimated charging time is required")
    private Integer estimatedChargingTime;
}