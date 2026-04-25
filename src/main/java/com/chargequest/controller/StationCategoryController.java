package com.chargequest.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chargequest.DTO.ApiResponse;
import com.chargequest.DTO.StationCategoryRequestDTO;
import com.chargequest.DTO.StationCategoryResponseDTO;
import com.chargequest.service.StationCategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class StationCategoryController {

    private final StationCategoryService categoryService;

   
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> addCategory(
            @Valid @RequestBody StationCategoryRequestDTO request) {

        return ResponseEntity.ok(categoryService.addCategory(request) );
    }

    @GetMapping
    public ResponseEntity<List<StationCategoryResponseDTO>> getAllCategories() {

        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
