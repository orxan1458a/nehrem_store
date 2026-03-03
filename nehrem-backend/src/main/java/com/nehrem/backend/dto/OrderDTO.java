package com.nehrem.backend.dto;

import com.nehrem.backend.entity.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "First name is required")
        @Size(max = 100)
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(max = 100)
        private String lastName;

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[+]?[0-9\\s\\-()]{7,20}$", message = "Invalid phone number format")
        private String phone;

        @NotNull(message = "Delivery method is required")
        private Order.DeliveryMethod deliveryMethod;

        private String address;

        private String notes;

        @NotEmpty(message = "Order must have at least one item")
        @Valid
        private List<ItemRequest> items;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ItemResponse {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String firstName;
        private String lastName;
        private String phone;
        private Order.DeliveryMethod deliveryMethod;
        private String address;
        private BigDecimal totalAmount;
        private Order.OrderStatus status;
        private String notes;
        private List<ItemResponse> items;
        private LocalDateTime createdAt;
    }
}
