package com.chargequest.service;

import java.util.List;

import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.StationCategoryRequestDTO;
import com.chargequest.tempdto.StationCategoryResponseDTO;

public interface StationCategoryService {

    ApiResponse addCategory(StationCategoryRequestDTO request);

    List<StationCategoryResponseDTO> getAllCategories();
}
