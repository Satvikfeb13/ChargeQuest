package com.chargequest.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StationCategoryResponseDTO {

    private Long categoryId;
    private String categoryName;
    private String connectorType;
    private Integer minChargingTime;
    private Integer maxChargingTime;
    private String powerOutput;
    private String pricingModel;
}
