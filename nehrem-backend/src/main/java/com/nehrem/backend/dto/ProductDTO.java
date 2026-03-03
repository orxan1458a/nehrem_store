package com.nehrem.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Product name is required")
        @Size(max = 255, message = "Product name must not exceed 255 characters")
        private String name;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private BigDecimal price;

        @DecimalMin(value = "0.01", message = "Discount price must be greater than 0")
        private BigDecimal discountPrice;

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity must be >= 0")
        private Integer stockQuantity;

        private Long categoryId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal discountPrice;
        private Integer stockQuantity;
        private String imageUrl;
        private Long categoryId;
        private String categoryName;
        private Boolean active;
        private LocalDateTime createdAt;
    }
}
