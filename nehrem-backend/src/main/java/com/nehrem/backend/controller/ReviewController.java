package com.nehrem.backend.controller;

import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.dto.ReviewDTO;
import com.nehrem.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewDTO.Response>>> getByProduct(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getByProductId(productId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDTO.Response>> create(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Review created", reviewService.create(productId, request)));
    }
}
