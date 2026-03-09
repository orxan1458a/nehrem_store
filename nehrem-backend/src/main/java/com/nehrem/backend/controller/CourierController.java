package com.nehrem.backend.controller;

import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.entity.User;
import com.nehrem.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courier")
@RequiredArgsConstructor
public class CourierController {

    private final OrderService orderService;

    /** GET /api/courier/orders  — returns orders assigned to the authenticated courier. */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderDTO.Response>>> getOrders(
            @AuthenticationPrincipal User courier,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OrderDTO.Response> orders = orderService.getCourierOrders(
                courier.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    /** PATCH /api/courier/orders/{id}/delivered */
    @PatchMapping("/orders/{id}/delivered")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> markDelivered(
            @PathVariable Long id,
            @AuthenticationPrincipal User courier) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.markDelivered(id, courier.getId())));
    }
}
