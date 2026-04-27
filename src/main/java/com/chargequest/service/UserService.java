package com.chargequest.service;

import com.chargequest.model.User;
import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.LoginRequest;
import com.chargequest.tempdto.RegisterRequest;
import com.chargequest.tempdto.UserResponseDTO;

public interface UserService {
    ApiResponse registerUser(RegisterRequest request);
    ApiResponse loginUser(LoginRequest request);
    UserResponseDTO getUserById(Long userId);
    ApiResponse updateUser(Long userId, RegisterRequest request);

}
