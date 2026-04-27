package com.chargequest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StationCategoryRequestDTO {

    @NotBlank
    private String categoryName;

    private String connectorType;
    private Integer minChargingTime;
    private Integer maxChargingTime;
    private String powerOutput;
    private String pricingModel;
}
