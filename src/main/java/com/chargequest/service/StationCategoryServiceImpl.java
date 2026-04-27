package com.chargequest.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.chargequest.dto.ApiResponse;
import com.chargequest.dto.ResponseStatus;
import com.chargequest.dto.StationCategoryRequestDTO;
import com.chargequest.dto.StationCategoryResponseDTO;
import com.chargequest.model.StationCategory;
import com.chargequest.repository.StationCategoryRepositary;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StationCategoryServiceImpl implements StationCategoryService {

    private final StationCategoryRepositary categoryRepository;
    private final ModelMapper modelMapper;

    @Override
    public ApiResponse addCategory(StationCategoryRequestDTO request) {

        StationCategory category =
                modelMapper.map(request, StationCategory.class);
        System.out.println("categoryName = " + category.getCategoryName());



        categoryRepository.save(category);

        return new ApiResponse(
                "Station category added successfully",
                ResponseStatus.SUCCESS
        );
    }

    @Override
    public List<StationCategoryResponseDTO> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(category ->
                        modelMapper.map(category, StationCategoryResponseDTO.class))
                .toList();
    }
    
}
