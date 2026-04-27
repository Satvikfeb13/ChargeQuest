package com.chargequest.tempdto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class StationResponseDTO {

    private Long stationId;
    private String stationName;
    private String address;

    private Integer totalSlots;
    private Integer availableSlots;

    private Double pricePerUnit;

    private Long categoryId;
    private String categoryName;
}

