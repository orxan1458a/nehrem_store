package com.nehrem.backend.controller;

import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.dto.InventoryDTO;
import com.nehrem.backend.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    /** List all batches for a product (oldest first). */
    @GetMapping("/{productId}/batches")
    public ResponseEntity<ApiResponse<List<InventoryDTO.BatchResponse>>> getBatches(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getBatches(productId)));
    }

    /** Add a new stock batch (admin restock). Updates product stockQuantity. */
    @PostMapping("/{productId}/batches")
    public ResponseEntity<ApiResponse<InventoryDTO.BatchResponse>> addBatch(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryDTO.AddBatchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.addBatch(productId, request)));
    }
}
