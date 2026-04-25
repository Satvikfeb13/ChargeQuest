package com.chargequest.service;

import java.util.List;

import com.chargequest.DTO.ApiResponse;
import com.chargequest.DTO.StationCategoryRequestDTO;
import com.chargequest.DTO.StationCategoryResponseDTO;

public interface StationCategoryService {

    ApiResponse addCategory(StationCategoryRequestDTO request);

    List<StationCategoryResponseDTO> getAllCategories();
}
