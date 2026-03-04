package com.nehrem.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ReviewDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        private Integer rating;

        private String comment;

        @Size(max = 100, message = "Reviewer name must not exceed 100 characters")
        private String reviewerName;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long productId;
        private Integer rating;
        private String comment;
        private String reviewerName;
        private LocalDateTime createdAt;
    }
}
