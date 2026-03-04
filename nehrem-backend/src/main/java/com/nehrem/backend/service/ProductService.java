package com.nehrem.backend.service;

import com.nehrem.backend.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {
    Page<ProductDTO.Response> getAll(Long categoryId, String search, Pageable pageable);
    ProductDTO.Response getById(Long id);
    ProductDTO.Response create(ProductDTO.Request request, MultipartFile image);
    ProductDTO.Response update(Long id, ProductDTO.Request request, MultipartFile image);
    void delete(Long id);
    void toggleActive(Long id);
    void incrementView(Long id);
}
