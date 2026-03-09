package com.nehrem.backend.service;

import com.nehrem.backend.dto.AuthDTO;

public interface AuthService {
    AuthDTO.LoginResponse login(AuthDTO.LoginRequest request);
}
