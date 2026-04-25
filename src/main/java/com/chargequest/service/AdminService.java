package com.chargequest.service;

import java.util.List;

import com.chargequest.DTO.ApiResponse;
import com.chargequest.DTO.UserResponseDTO;

public interface AdminService {
    List<UserResponseDTO> getAllUsers();

    ApiResponse makeUserAdmin(Long userId);

    ApiResponse deleteUser(Long userId);

}
