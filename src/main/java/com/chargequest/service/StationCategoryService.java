package com.chargequest.service;

import java.util.List;

import com.chargequest.dto.ApiResponse;
import com.chargequest.dto.StationCategoryRequestDTO;
import com.chargequest.dto.StationCategoryResponseDTO;

public interface StationCategoryService {

    ApiResponse addCategory(StationCategoryRequestDTO request);

    List<StationCategoryResponseDTO> getAllCategories();
}
