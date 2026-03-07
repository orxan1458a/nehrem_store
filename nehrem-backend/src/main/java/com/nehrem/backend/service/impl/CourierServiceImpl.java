package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.CourierDTO;
import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.entity.Courier;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.CourierRepository;
import com.nehrem.backend.service.CourierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CourierServiceImpl implements CourierService {

    private final CourierRepository courierRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CourierDTO.Response> getAll() {
        return courierRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO.CourierInfo> getActive() {
        return courierRepository.findByActiveTrue().stream()
                .map(c -> OrderDTO.CourierInfo.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .phone(c.getPhone())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public CourierDTO.Response create(CourierDTO.Request request) {
        if (courierRepository.findByUsernameAndPassword(request.getUsername(), "").isPresent()
                || courierRepository.findAll().stream()
                        .anyMatch(c -> c.getUsername().equalsIgnoreCase(request.getUsername()))) {
            throw new BusinessException("Bu istifadəçi adı artıq mövcuddur");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("Şifrə tələb olunur");
        }
        Courier courier = Courier.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .username(request.getUsername().trim().toLowerCase())
                .password(request.getPassword())
                .active(true)
                .build();
        return toResponse(courierRepository.save(courier));
    }

    @Override
    public CourierDTO.Response update(Long id, CourierDTO.Request request) {
        Courier courier = courierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Courier", id));

        // Check username uniqueness (exclude self)
        boolean usernameTaken = courierRepository.findAll().stream()
                .anyMatch(c -> !c.getId().equals(id)
                        && c.getUsername().equalsIgnoreCase(request.getUsername()));
        if (usernameTaken) {
            throw new BusinessException("Bu istifadəçi adı artıq mövcuddur");
        }

        courier.setName(request.getName());
        courier.setPhone(request.getPhone());
        courier.setUsername(request.getUsername().trim().toLowerCase());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            courier.setPassword(request.getPassword());
        }
        return toResponse(courierRepository.save(courier));
    }

    @Override
    public CourierDTO.Response toggleActive(Long id) {
        Courier courier = courierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Courier", id));
        courier.setActive(!courier.getActive());
        return toResponse(courierRepository.save(courier));
    }

    @Override
    public void delete(Long id) {
        if (!courierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Courier", id);
        }
        courierRepository.deleteById(id);
    }

    private CourierDTO.Response toResponse(Courier c) {
        return CourierDTO.Response.builder()
                .id(c.getId())
                .name(c.getName())
                .phone(c.getPhone())
                .username(c.getUsername())
                .active(c.getActive())
                .build();
    }
}
