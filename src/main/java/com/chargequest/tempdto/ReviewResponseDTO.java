package com.chargequest.tempdto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewResponseDTO {

    private Long reviewId;

    // User info (read-only)
    private Long userId;
    private String email;

    // Station info (read-only)
    private Long stationId;
    private String stationName;

    // Review details
    private Integer rating;
    private String comment;

    // Audit
    private LocalDateTime createdAt;
}
