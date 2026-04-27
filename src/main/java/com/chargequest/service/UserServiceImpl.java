package com.chargequest.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chargequest.customException.AuthenticationException;
import com.chargequest.customException.ResourceNotFoundException;
import com.chargequest.dto.ApiResponse;
import com.chargequest.dto.LoginRequest;
import com.chargequest.dto.RegisterRequest;
import com.chargequest.dto.ResponseStatus;
import com.chargequest.dto.UserResponseDTO;
import com.chargequest.model.Role;
import com.chargequest.model.User;
import com.chargequest.repository.UserRepository;

import lombok.AllArgsConstructor;
@Service
@Transactional
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    @Override
    public ApiResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthenticationException("Email already registered");
        }

        User user = modelMapper.map(request, User.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);

        userRepository.save(user);
 
        return new ApiResponse("User registered successfully", ResponseStatus.SUCCESS);
    }

    @Override
    public ApiResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid email"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Invalid password");
        }

        return new ApiResponse("Login successful", ResponseStatus.SUCCESS);
    }

    @Override
    public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserResponseDTO dto = modelMapper.map(user, UserResponseDTO.class);
        dto.setRole(user.getRole().name());

        return dto;
    }

    @Override
    public ApiResponse updateUser(Long userId, RegisterRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        modelMapper.map(request, user);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);

        return new ApiResponse("User updated successfully", ResponseStatus.SUCCESS);
    }
}
