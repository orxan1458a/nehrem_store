package com.nehrem.backend.service;

import com.nehrem.backend.dto.ReviewDTO;

import java.util.List;

public interface ReviewService {
    List<ReviewDTO.Response> getByProductId(Long productId);
    ReviewDTO.Response create(Long productId, ReviewDTO.Request request);
}
