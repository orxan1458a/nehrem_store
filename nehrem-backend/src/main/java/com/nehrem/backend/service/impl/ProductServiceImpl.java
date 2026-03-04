package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.ProductDTO;
import com.nehrem.backend.entity.Category;
import com.nehrem.backend.entity.Product;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.CategoryRepository;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.repository.ReviewRepository;
import com.nehrem.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO.Response> getAll(Long categoryId, String search, Pageable pageable) {
        return productRepository.findByFilters(categoryId, search, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO.Response getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public ProductDTO.Response create(ProductDTO.Request request, MultipartFile image) {
        Category category = resolveCategory(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .stockQuantity(request.getStockQuantity())
                .category(category)
                .active(true)
                .build();

        if (image != null && !image.isEmpty()) {
            product.setImageUrl(saveImage(image));
        }

        return toResponse(productRepository.save(product));
    }

    @Override
    public ProductDTO.Response update(Long id, ProductDTO.Request request, MultipartFile image) {
        Product product = findById(id);
        Category category = resolveCategory(request.getCategoryId());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);

        if (image != null && !image.isEmpty()) {
            deleteImageFile(product.getImageUrl());
            product.setImageUrl(saveImage(image));
        }

        return toResponse(productRepository.save(product));
    }

    @Override
    public void delete(Long id) {
        Product product = findById(id);
        deleteImageFile(product.getImageUrl());
        productRepository.delete(product);
    }

    @Override
    public void toggleActive(Long id) {
        Product product = findById(id);
        product.setActive(!product.getActive());
        productRepository.save(product);
    }

    @Override
    public void incrementView(Long id) {
        Product product = findById(id);
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);
    }

    // ── Helpers ──────────────────────────────────────────────

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
    }

    private String saveImage(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalFilename = StringUtils.cleanPath(
                    Objects.requireNonNull(file.getOriginalFilename()));
            String extension = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String fileName = UUID.randomUUID() + extension;

            Files.copy(file.getInputStream(),
                    uploadPath.resolve(fileName),
                    StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new BusinessException("Could not save image: " + ex.getMessage());
        }
    }

    private void deleteImageFile(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;
        try {
            String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}
    }

    private ProductDTO.Response toResponse(Product p) {
        return ProductDTO.Response.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .stockQuantity(p.getStockQuantity())
                .imageUrl(p.getImageUrl())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .reviewCount(reviewRepository.countByProductId(p.getId()))
                .averageRating(reviewRepository.averageRatingByProductId(p.getId()))
                .viewCount(p.getViewCount())
                .build();
    }
}
