package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.external.DummyJsonProduct;
import com.nehrem.backend.dto.external.DummyJsonProductsResponse;
import com.nehrem.backend.dto.external.DummyJsonReview;
import com.nehrem.backend.entity.Category;
import com.nehrem.backend.entity.InventoryBatch;
import com.nehrem.backend.entity.Product;
import com.nehrem.backend.entity.Review;
import com.nehrem.backend.repository.CategoryRepository;
import com.nehrem.backend.repository.InventoryBatchRepository;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.repository.ReviewRepository;
import com.nehrem.backend.service.ExternalDataSeederService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalDataSeederServiceImpl implements ExternalDataSeederService {

    // ── External API ──────────────────────────────────────────────────────────
    private static final String DUMMYJSON_URL =
            "https://dummyjson.com/products?limit=100&skip=0&select=id,title,description,category,price,discountPercentage,stock,thumbnail,reviews";

    // ── COGS ratio: inventory purchase cost = 60% of selling price ────────────
    private static final BigDecimal COGS_RATIO = new BigDecimal("0.60");

    // ── Discount threshold: only apply discount when >= 5% off ────────────────
    private static final double MIN_DISCOUNT_PCT = 5.0;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private final RestTemplate            restTemplate;
    private final CategoryRepository      categoryRepository;
    private final ProductRepository       productRepository;
    private final InventoryBatchRepository inventoryBatchRepository;
    private final ReviewRepository        reviewRepository;

    @Override
    @Transactional
    public String seedFromExternalApi() {
        log.info("Starting external data seeding from DummyJSON...");

        // ── 1. Fetch data from DummyJSON ──────────────────────────────────────
        DummyJsonProductsResponse apiResponse;
        try {
            apiResponse = restTemplate.getForObject(DUMMYJSON_URL, DummyJsonProductsResponse.class);
        } catch (Exception ex) {
            log.error("Failed to fetch products from DummyJSON: {}", ex.getMessage());
            throw new RuntimeException("External API call failed: " + ex.getMessage(), ex);
        }

        if (apiResponse == null || apiResponse.getProducts() == null || apiResponse.getProducts().isEmpty()) {
            log.warn("DummyJSON returned no products.");
            return "No products returned from external API.";
        }

        List<DummyJsonProduct> rawProducts = apiResponse.getProducts();
        log.info("Fetched {} products from DummyJSON.", rawProducts.size());

        int categoriesCreated = 0;
        int productsCreated   = 0;
        int reviewsCreated    = 0;

        // ── 2. Process each product ───────────────────────────────────────────
        for (DummyJsonProduct raw : rawProducts) {

            // 2a. Resolve or create Category
            Category category = resolveCategory(raw.getCategory());
            if (category.getId() == null) {
                category = categoryRepository.save(category);
                categoriesCreated++;
                log.debug("Created category: {}", category.getName());
            }

            // 2b. Skip product if it already exists (idempotent)
            String productName = sanitize(raw.getTitle());
            if (productRepository.existsByNameIgnoreCase(productName)) {
                log.debug("Product '{}' already exists — skipping.", productName);
                continue;
            }

            // 2c. Build Product entity
            Product product = buildProduct(raw, category);
            product = productRepository.save(product);
            productsCreated++;
            log.debug("Created product: {} (stock={})", product.getName(), product.getStockQuantity());

            // 2d. Create InventoryBatch (FIFO seed — one initial batch)
            if (product.getStockQuantity() > 0) {
                InventoryBatch batch = InventoryBatch.builder()
                        .product(product)
                        .purchasePrice(product.getPrice().multiply(COGS_RATIO).setScale(2, RoundingMode.HALF_UP))
                        .quantity(product.getStockQuantity())
                        .dateAdded(LocalDateTime.now())
                        .build();
                inventoryBatchRepository.save(batch);
            }

            // 2e. Persist reviews
            if (raw.getReviews() != null) {
                for (DummyJsonReview rawReview : raw.getReviews()) {
                    Review review = buildReview(rawReview, product);
                    reviewRepository.save(review);
                    reviewsCreated++;
                }
            }
        }

        String summary = String.format(
                "Seeding complete. Categories created: %d | Products created: %d | Reviews created: %d",
                categoriesCreated, productsCreated, reviewsCreated);
        log.info(summary);
        return summary;
    }

    // ── Image sync ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public String syncProductImages() {
        log.info("Starting product image sync...");

        Path uploadPath;
        try {
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
        } catch (IOException ex) {
            throw new RuntimeException("Cannot create upload directory: " + ex.getMessage(), ex);
        }

        List<Product> allProducts = productRepository.findAll();

        int downloaded = 0;
        int skipped    = 0;
        int failed     = 0;

        for (Product product : allProducts) {
            String url = product.getImageUrl();

            // Skip products that already have a local image
            if (url == null || url.isBlank() || url.startsWith("/uploads/")) {
                skipped++;
                continue;
            }

            try {
                // Determine file extension from the URL path
                String urlPath  = URI.create(url).getPath();
                String ext      = urlPath.contains(".")
                        ? urlPath.substring(urlPath.lastIndexOf('.')).toLowerCase()
                        : ".jpg";
                // Guard against long or unusual extensions
                if (ext.length() > 5) ext = ".jpg";

                String   fileName  = UUID.randomUUID() + ext;
                Path     destFile  = uploadPath.resolve(fileName);

                // Download raw bytes
                byte[] imageBytes = restTemplate.getForObject(url, byte[].class);
                if (imageBytes == null || imageBytes.length == 0) {
                    log.warn("Empty response downloading image for product '{}': {}", product.getName(), url);
                    failed++;
                    continue;
                }

                Files.write(destFile, imageBytes);

                product.setImageUrl("/uploads/" + fileName);
                productRepository.save(product);

                downloaded++;
                log.debug("Downloaded image for '{}' → {}", product.getName(), fileName);

            } catch (Exception ex) {
                log.warn("Failed to download image for product '{}' ({}): {}",
                        product.getName(), url, ex.getMessage());
                failed++;
            }
        }

        String summary = String.format(
                "Image sync complete. Downloaded: %d | Already local: %d | Failed: %d",
                downloaded, skipped, failed);
        log.info(summary);
        return summary;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Finds an existing Category or builds a new (unsaved) one.
     * Category names from DummyJSON look like "beauty" or "mens-shirts" — we
     * convert them to title-case for a nicer display.
     */
    private Category resolveCategory(String rawName) {
        String displayName = toTitleCase(rawName);
        return categoryRepository.findByNameIgnoreCase(displayName)
                .orElseGet(() -> Category.builder()
                        .name(displayName)
                        .description("Products in the " + displayName + " category")
                        .build());
    }

    /**
     * Maps a DummyJSON product payload to our Product entity.
     */
    private Product buildProduct(DummyJsonProduct raw, Category category) {
        BigDecimal price = BigDecimal.valueOf(raw.getPrice()).setScale(2, RoundingMode.HALF_UP);

        BigDecimal discountPrice   = null;
        Instant    discountStart   = null;
        Instant    discountEnd     = null;

        double discountPct = raw.getDiscountPercentage() != null ? raw.getDiscountPercentage() : 0.0;
        if (discountPct >= MIN_DISCOUNT_PCT) {
            BigDecimal multiplier = BigDecimal.ONE.subtract(
                    BigDecimal.valueOf(discountPct / 100.0).setScale(4, RoundingMode.HALF_UP));
            discountPrice = price.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
            discountStart = Instant.now();
            discountEnd   = Instant.now().plus(30, ChronoUnit.DAYS);
        }

        int stock = raw.getStock() != null ? raw.getStock() : 10;

        return Product.builder()
                .name(sanitize(raw.getTitle()))
                .description(raw.getDescription())
                .price(price)
                .discountPrice(discountPrice)
                .discountStartDate(discountStart)
                .discountEndDate(discountEnd)
                .stockQuantity(stock)
                .imageUrl(raw.getThumbnail())
                .category(category)
                .active(true)
                .viewCount(0L)
                .build();
    }

    /**
     * Maps a DummyJSON review to our Review entity.
     */
    private Review buildReview(DummyJsonReview rawReview, Product product) {
        int rating = rawReview.getRating() != null
                ? Math.max(1, Math.min(5, rawReview.getRating()))
                : 3;

        return Review.builder()
                .product(product)
                .rating(rating)
                .comment(rawReview.getComment())
                .reviewerName(rawReview.getReviewerName())
                .build();
    }

    /**
     * Converts a slug like "mens-shirts" or "beauty" to "Mens Shirts" / "Beauty".
     */
    private String toTitleCase(String slug) {
        if (slug == null || slug.isBlank()) return "General";
        String[] words = slug.replace("-", " ").split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                  .append(word.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }

    /** Trims and caps the title to 255 characters (column limit). */
    private String sanitize(String value) {
        if (value == null) return "";
        value = value.trim();
        return value.length() > 255 ? value.substring(0, 255) : value;
    }
}
