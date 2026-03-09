package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.AuthDTO;
import com.nehrem.backend.entity.User;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.repository.UserRepository;
import com.nehrem.backend.security.JwtUtils;
import com.nehrem.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils        jwtUtils;

    @Override
    public AuthDTO.LoginResponse login(AuthDTO.LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException("İstifadəçi adı və ya şifrə yanlışdır"));

        if (!user.isEnabled()) {
            throw new BusinessException("Bu hesab deaktiv edilib");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("İstifadəçi adı və ya şifrə yanlışdır");
        }

        String token = jwtUtils.generateToken(user);

        return AuthDTO.LoginResponse.builder()
                .accessToken(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .build();
    }
}
