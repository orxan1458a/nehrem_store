package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.ReviewDTO;
import com.nehrem.backend.entity.Product;
import com.nehrem.backend.entity.Review;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.repository.ReviewRepository;
import com.nehrem.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO.Response> getByProductId(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public ReviewDTO.Response create(Long productId, ReviewDTO.Request request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        Review review = Review.builder()
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .reviewerName(request.getReviewerName())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    private ReviewDTO.Response toResponse(Review r) {
        return ReviewDTO.Response.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .reviewerName(r.getReviewerName())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
