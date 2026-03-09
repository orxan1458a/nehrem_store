package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.ProductDTO;
import com.nehrem.backend.entity.Category;
import com.nehrem.backend.entity.InventoryBatch;
import com.nehrem.backend.entity.Product;
import com.nehrem.backend.entity.ProductView;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.CategoryRepository;
import com.nehrem.backend.repository.InventoryBatchRepository;
import com.nehrem.backend.repository.OrderItemRepository;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.repository.ProductViewRepository;
import com.nehrem.backend.repository.ReviewRepository;
import com.nehrem.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository        productRepository;
    private final CategoryRepository       categoryRepository;
    private final ReviewRepository         reviewRepository;
    private final ProductViewRepository    productViewRepository;
    private final InventoryBatchRepository inventoryBatchRepository;
    private final OrderItemRepository      orderItemRepository;

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
    public Page<ProductDTO.Response> getAllAdmin(String search, Pageable pageable) {
        return productRepository.findAllByFiltersAdmin(search, pageable)
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

        // If a purchase price is provided, start stockQuantity at 0 and let the batch add it.
        // Otherwise, set directly (backward compat — no batch tracking).
        boolean hasPurchasePrice = request.getPurchasePrice() != null
                && request.getPurchasePrice().compareTo(BigDecimal.ZERO) > 0;

        Instant discountStart = request.getDiscountPrice() != null ? Instant.now() : null;
        Instant discountEnd   = request.getDiscountPrice() != null ? request.getDiscountEndDate() : null;

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .discountStartDate(discountStart)
                .discountEndDate(discountEnd)
                .stockQuantity(hasPurchasePrice ? 0 : request.getStockQuantity())
                .category(category)
                .active(true)
                .build();

        if (image != null && !image.isEmpty()) {
            product.setImageUrl(saveImage(image));
        }

        product = productRepository.save(product);

        if (hasPurchasePrice && request.getStockQuantity() > 0) {
            InventoryBatch batch = InventoryBatch.builder()
                    .product(product)
                    .purchasePrice(request.getPurchasePrice())
                    .quantity(request.getStockQuantity())
                    .dateAdded(LocalDateTime.now())
                    .build();
            inventoryBatchRepository.save(batch);
            product.setStockQuantity(request.getStockQuantity());
            productRepository.save(product);
        }

        return toResponse(product);
    }

    @Override
    public ProductDTO.Response update(Long id, ProductDTO.Request request, MultipartFile image) {
        Product product = findById(id);
        Category category = resolveCategory(request.getCategoryId());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);

        // Discount: set start date when a new discount price is being applied or changed.
        if (request.getDiscountPrice() != null) {
            boolean discountChanged = !request.getDiscountPrice().equals(product.getDiscountPrice())
                    || product.getDiscountStartDate() == null;
            if (discountChanged) {
                product.setDiscountStartDate(Instant.now());
            }
            product.setDiscountPrice(request.getDiscountPrice());
            product.setDiscountEndDate(request.getDiscountEndDate());
        } else {
            product.setDiscountPrice(null);
            product.setDiscountStartDate(null);
            product.setDiscountEndDate(null);
        }

        if (image != null && !image.isEmpty()) {
            deleteImageFile(product.getImageUrl());
            product.setImageUrl(saveImage(image));
        }

        return toResponse(productRepository.save(product));
    }

    @Override
    public void delete(Long id) {
        Product product = findById(id);
        if (orderItemRepository.existsByProductId(id)) {
            throw new BusinessException("Bu məhsul sifarişlərdə istifadə olunub və silinə bilməz. Əvəzinə deaktiv edin.");
        }
        reviewRepository.deleteByProductId(id);
        inventoryBatchRepository.deleteByProductId(id);
        productViewRepository.deleteByProductId(id);
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
    public void incrementView(Long id, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) return;
        if (productViewRepository.existsByProductIdAndDeviceId(id, deviceId)) return;

        Product product = findById(id);
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);

        productViewRepository.save(ProductView.builder()
                .productId(id)
                .deviceId(deviceId)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO.Response> getFlashSaleProducts() {
        return productRepository.findActiveLimitedDiscountProducts(Instant.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Runs every minute; clears expired discounts so products revert to their
     * normal price automatically without a manual admin action.
     */
    @Scheduled(fixedRate = 60_000)
    public void expireDiscounts() {
        List<Product> expired = productRepository.findExpiredDiscounts(Instant.now());
        for (Product p : expired) {
            p.setDiscountPrice(null);
            p.setDiscountStartDate(null);
            p.setDiscountEndDate(null);
            productRepository.save(p);
        }
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
        BigDecimal purchasePrice = inventoryBatchRepository
                .findTopByProductIdOrderByDateAddedDesc(p.getId())
                .map(InventoryBatch::getPurchasePrice)
                .orElse(null);

        // If the discount end date has passed, treat the discount as inactive.
        // The scheduled job will persist the clearance; this guards reads in between runs.
        boolean discountExpired = p.getDiscountEndDate() != null
                && p.getDiscountEndDate().isBefore(Instant.now());

        BigDecimal effectiveDiscountPrice = discountExpired ? null : p.getDiscountPrice();
        Instant effectiveStartDate        = discountExpired ? null : p.getDiscountStartDate();
        Instant effectiveEndDate          = discountExpired ? null : p.getDiscountEndDate();

        return ProductDTO.Response.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .discountPrice(effectiveDiscountPrice)
                .discountStartDate(effectiveStartDate)
                .discountEndDate(effectiveEndDate)
                .stockQuantity(p.getStockQuantity())
                .imageUrl(p.getImageUrl())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .reviewCount(reviewRepository.countByProductId(p.getId()))
                .averageRating(reviewRepository.averageRatingByProductId(p.getId()))
                .viewCount(p.getViewCount())
                .purchasePrice(purchasePrice)
                .build();
    }
}
