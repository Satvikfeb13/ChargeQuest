package com.chargequest.service;

import java.util.List;

import com.chargequest.dto.ApiResponse;
import com.chargequest.dto.UserResponseDTO;

public interface AdminService {
    List<UserResponseDTO> getAllUsers();

    ApiResponse makeUserAdmin(Long userId);

    ApiResponse deleteUser(Long userId);

}
