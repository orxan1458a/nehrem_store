package com.nehrem.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InventoryDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AddBatchRequest {
        @NotNull(message = "Purchase price is required")
        @DecimalMin(value = "0.01", message = "Purchase price must be greater than 0")
        private BigDecimal purchasePrice;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BatchResponse {
        private Long id;
        private Long productId;
        private String productName;
        private BigDecimal purchasePrice;
        private Integer quantity;
        private LocalDateTime dateAdded;
    }
}
