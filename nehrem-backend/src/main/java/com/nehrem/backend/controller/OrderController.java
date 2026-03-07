package com.nehrem.backend.controller;

import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.entity.Order;
import com.nehrem.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ── Public: place an order ──────────────────────────────────────────────

    @PostMapping("/api/orders")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> create(
            @Valid @RequestBody OrderDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully", orderService.create(request)));
    }

    // ── Admin: list / get ───────────────────────────────────────────────────

    @GetMapping("/api/orders")
    public ResponseEntity<ApiResponse<Page<OrderDTO.Response>>> getAll(
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "20")  int size,
            @RequestParam(required = false)     String status) {
        PageRequest pr = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderDTO.Response> orders = (status != null && !status.isBlank())
                ? orderService.getAllByStatus(Order.OrderStatus.valueOf(status.toUpperCase()), pr)
                : orderService.getAll(pr);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/api/orders/{id}")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getById(id)));
    }

    // ── Admin: update status ────────────────────────────────────────────────

    @PatchMapping("/api/admin/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderDTO.StatusUpdateRequest body) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.updateStatus(id, body.getOrderStatus())));
    }

    // ── Admin: accept (optionally with courier) ─────────────────────────────

    @PutMapping("/api/admin/orders/{id}/accept")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> acceptOrder(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        Long courierId = null;
        if (body != null && body.get("courierId") instanceof Number n) {
            courierId = n.longValue();
        }
        return ResponseEntity.ok(ApiResponse.ok(orderService.acceptOrder(id, courierId)));
    }

    // ── Admin: cancel ───────────────────────────────────────────────────────

    @PutMapping("/api/admin/orders/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.cancelOrder(id)));
    }

    // ── Admin: assign courier ───────────────────────────────────────────────

    @PatchMapping("/api/admin/orders/{id}/assign-courier")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> assignCourier(
            @PathVariable Long id,
            @RequestBody OrderDTO.CourierAssignRequest body) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.assignCourier(id, body.getCourierId())));
    }

    @PutMapping("/api/admin/orders/{id}/assign-courier")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> assignCourierPut(
            @PathVariable Long id,
            @RequestBody OrderDTO.CourierAssignRequest body) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.assignCourier(id, body.getCourierId())));
    }

}
