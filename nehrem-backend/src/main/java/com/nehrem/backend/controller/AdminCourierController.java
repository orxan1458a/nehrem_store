package com.nehrem.backend.controller;

import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.dto.CourierDTO;
import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.service.CourierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/couriers")
@RequiredArgsConstructor
public class AdminCourierController {

    private final CourierService courierService;

    /** Active couriers list — used by order assignment dropdown. */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDTO.CourierInfo>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(courierService.getActive()));
    }

    /** Full list including inactive — used by management page. */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CourierDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(courierService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourierDTO.Response>> create(
            @Valid @RequestBody CourierDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Kuryer yaradıldı", courierService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourierDTO.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody CourierDTO.Request request) {
        return ResponseEntity.ok(ApiResponse.ok(courierService.update(id, request)));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<CourierDTO.Response>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(courierService.toggleActive(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        courierService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Kuryer silindi", null));
    }
}
