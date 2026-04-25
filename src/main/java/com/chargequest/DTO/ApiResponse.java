package com.chargequest.DTO;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiResponse {
	
    private LocalDateTime timeStamp;
    private String message;
    private ResponseStatus status;

    public ApiResponse(String message, ResponseStatus status) {
        this.message = message;
        this.status = status;
        this.timeStamp = LocalDateTime.now();
    }
}
