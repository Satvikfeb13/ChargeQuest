package com.chargequest.service;

import com.chargequest.DTO.ApiResponse;
import com.chargequest.DTO.LoginRequest;
import com.chargequest.DTO.RegisterRequest;
import com.chargequest.DTO.UserResponseDTO;
import com.chargequest.model.User;

public interface UserService {
    ApiResponse registerUser(RegisterRequest request);
    ApiResponse loginUser(LoginRequest request);
    UserResponseDTO getUserById(Long userId);
    ApiResponse updateUser(Long userId, RegisterRequest request);

}
