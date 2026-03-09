package com.nehrem.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
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

        /** Optional: when the discount should automatically expire (UTC Instant). */
        private Instant discountEndDate;

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity must be >= 0")
        private Integer stockQuantity;

        private Long categoryId;

        /** Optional: purchase price for initial inventory batch. Admin-only. */
        @DecimalMin(value = "0.01", message = "Purchase price must be greater than 0")
        private BigDecimal purchasePrice;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal discountPrice;
        /** UTC — serialized as "...Z" so browsers always parse it as UTC. */
        private Instant discountStartDate;
        /** UTC — serialized as "...Z" so browsers always parse it as UTC. */
        private Instant discountEndDate;
        private Integer stockQuantity;
        private String imageUrl;
        private Long categoryId;
        private String categoryName;
        private Boolean active;
        private LocalDateTime createdAt;
        private Long reviewCount;
        private Double averageRating;
        private Long viewCount;
        /** Latest batch purchase price. Admin-only — not shown on public shop. */
        private BigDecimal purchasePrice;
    }
}
