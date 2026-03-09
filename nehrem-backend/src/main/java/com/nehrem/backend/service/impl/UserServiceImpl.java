package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.UserDTO;
import com.nehrem.backend.entity.User;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.repository.UserRepository;
import com.nehrem.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository    userRepository;
    private final PasswordEncoder   passwordEncoder;

    @Override
    @Transactional
    public void changePassword(String username, UserDTO.ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("İstifadəçi tapılmadı"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Cari şifrə yanlışdır");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Yeni şifrələr uyğun gəlmir");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BusinessException("Yeni şifrə cari şifrə ilə eyni ola bilməz");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
