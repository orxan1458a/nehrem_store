package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.CourierDTO;
import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.entity.User;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.UserRepository;
import com.nehrem.backend.service.CourierService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CourierServiceImpl implements CourierService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<CourierDTO.Response> getAll() {
        return userRepository.findByRole(User.Role.COURIER)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO.CourierInfo> getActive() {
        return userRepository.findByRoleAndActiveTrue(User.Role.COURIER)
                .stream()
                .map(u -> OrderDTO.CourierInfo.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .phone(u.getPhone())
                        .build())
                .toList();
    }

    @Override
    public CourierDTO.Response create(CourierDTO.Request request) {
        if (userRepository.existsByUsername(request.getUsername().trim().toLowerCase())) {
            throw new BusinessException("Bu istifadəçi adı artıq mövcuddur");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("Şifrə tələb olunur");
        }
        User user = User.builder()
                .username(request.getUsername().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.COURIER)
                .name(request.getName())
                .phone(request.getPhone())
                .active(true)
                .build();
        return toResponse(userRepository.save(user));
    }

    @Override
    public CourierDTO.Response update(Long id, CourierDTO.Request request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Courier", id));

        String newUsername = request.getUsername().trim().toLowerCase();
        boolean usernameTaken = userRepository.findByRole(User.Role.COURIER).stream()
                .anyMatch(u -> !u.getId().equals(id) && u.getUsername().equals(newUsername));
        if (usernameTaken) {
            throw new BusinessException("Bu istifadəçi adı artıq mövcuddur");
        }

        user.setUsername(newUsername);
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return toResponse(userRepository.save(user));
    }

    @Override
    public CourierDTO.Response toggleActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Courier", id));
        user.setActive(!user.getActive());
        return toResponse(userRepository.save(user));
    }

    @Override
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Courier", id);
        }
        userRepository.deleteById(id);
    }

    private CourierDTO.Response toResponse(User u) {
        return CourierDTO.Response.builder()
                .id(u.getId())
                .name(u.getName())
                .phone(u.getPhone())
                .username(u.getUsername())
                .active(u.getActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
