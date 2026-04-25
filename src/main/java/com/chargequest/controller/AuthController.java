package com.chargequest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chargequest.DTO.AuthResponse;
import com.chargequest.DTO.LoginRequest;
import com.chargequest.DTO.RegisterRequest;
import com.chargequest.config.JwtUtils;
import com.chargequest.config.UserPrincipal;
import com.chargequest.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody @Valid LoginRequest request) {

        Authentication auth =
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword());

        Authentication authenticated =
                authenticationManager.authenticate(auth);

        UserPrincipal principal =
                (UserPrincipal) authenticated.getPrincipal();

        String token = jwtUtils.generateToken(principal); 

        return ResponseEntity.ok(
                new AuthResponse(token, "Login successful"));
    }
}
