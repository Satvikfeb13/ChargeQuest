package com.chargequest.service;

import com.chargequest.dto.ApiResponse;
import com.chargequest.dto.LoginRequest;
import com.chargequest.dto.RegisterRequest;
import com.chargequest.dto.UserResponseDTO;
import com.chargequest.model.User;

public interface UserService {
    ApiResponse registerUser(RegisterRequest request);
    ApiResponse loginUser(LoginRequest request);
    UserResponseDTO getUserById(Long userId);
    ApiResponse updateUser(Long userId, RegisterRequest request);

}
