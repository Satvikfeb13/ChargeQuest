package com.chargequest.tempdto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StationRequestDTO {

    @NotBlank(message = "Station name is required")
    private String stationName;

    @NotBlank(message = "Station address is required")
    private String address;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
    private Double longitude;

    @NotNull(message = "Price per unit is required")
    @PositiveOrZero(message = "Price per unit cannot be negative")
    private Double pricePerUnit;

    private String description; // optional

    @NotNull(message = "Total slots are required")
    @Positive(message = "Total slots must be greater than zero")
    private Integer totalSlots;

    @NotNull(message = "Category id is required")
    private Long categoryId;
}
