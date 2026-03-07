package com.nehrem.backend.controller;

import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.entity.Courier;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.repository.CourierRepository;
import com.nehrem.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/courier")
@RequiredArgsConstructor
public class CourierController {

    private final OrderService     orderService;
    private final CourierRepository courierRepository;

    /** POST /api/courier/login  { username, password } → { id, name } */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        Courier courier = courierRepository.findByUsernameAndPassword(username, password)
                .orElseThrow(() -> new BusinessException("Yanlış istifadəçi adı və ya şifrə"));
        if (!courier.getActive()) {
            throw new BusinessException("Bu hesab deaktiv edilib");
        }
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "id",   courier.getId(),
                "name", courier.getName()
        )));
    }

    /** GET /api/courier/orders?courierId=&page=&size= */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderDTO.Response>>> getOrders(
            @RequestParam Long courierId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OrderDTO.Response> orders = orderService.getCourierOrders(
                courierId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    /** PATCH /api/courier/orders/{id}/delivered  { courierId } */
    @PatchMapping("/orders/{id}/delivered")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> markDelivered(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        Long courierId = body.get("courierId");
        return ResponseEntity.ok(ApiResponse.ok(orderService.markDelivered(id, courierId)));
    }
}
