package com.chargequest.service;

import java.util.List;

import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.UserResponseDTO;

public interface AdminService {
    List<UserResponseDTO> getAllUsers();

    ApiResponse makeUserAdmin(Long userId);

    ApiResponse deleteUser(Long userId);

}
