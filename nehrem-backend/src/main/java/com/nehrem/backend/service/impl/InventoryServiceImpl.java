package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.InventoryDTO;
import com.nehrem.backend.entity.InventoryBatch;
import com.nehrem.backend.entity.Product;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.InventoryBatchRepository;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryBatchRepository batchRepository;
    private final ProductRepository        productRepository;

    @Override
    public BigDecimal deductFifo(Long productId, int quantity) {
        List<InventoryBatch> batches =
                batchRepository.findByProductIdAndQuantityGreaterThanOrderByDateAddedAsc(productId, 0);

        int remaining = quantity;
        BigDecimal totalCost = BigDecimal.ZERO;

        for (InventoryBatch batch : batches) {
            if (remaining <= 0) break;
            int take = Math.min(batch.getQuantity(), remaining);
            totalCost = totalCost.add(batch.getPurchasePrice().multiply(BigDecimal.valueOf(take)));
            batch.setQuantity(batch.getQuantity() - take);
            remaining -= take;
            batchRepository.save(batch);
        }
        // If no batches existed (legacy products), COGS stays ZERO — backward compatible.

        // Update product stockQuantity
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);

        return totalCost;
    }

    @Override
    public void returnStock(Long productId, int quantity, BigDecimal purchasePrice) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        InventoryBatch batch = InventoryBatch.builder()
                .product(product)
                .purchasePrice(purchasePrice.compareTo(BigDecimal.ZERO) > 0
                        ? purchasePrice : BigDecimal.ZERO)
                .quantity(quantity)
                .dateAdded(LocalDateTime.now())
                .build();
        batchRepository.save(batch);

        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
    }

    @Override
    public InventoryDTO.BatchResponse addBatch(Long productId, InventoryDTO.AddBatchRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        InventoryBatch batch = InventoryBatch.builder()
                .product(product)
                .purchasePrice(request.getPurchasePrice())
                .quantity(request.getQuantity())
                .dateAdded(LocalDateTime.now())
                .build();
        batch = batchRepository.save(batch);

        product.setStockQuantity(product.getStockQuantity() + request.getQuantity());
        productRepository.save(product);

        return toResponse(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO.BatchResponse> getBatches(Long productId) {
        return batchRepository.findByProductIdOrderByDateAddedAsc(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private InventoryDTO.BatchResponse toResponse(InventoryBatch b) {
        return InventoryDTO.BatchResponse.builder()
                .id(b.getId())
                .productId(b.getProduct().getId())
                .productName(b.getProduct().getName())
                .purchasePrice(b.getPurchasePrice())
                .quantity(b.getQuantity())
                .dateAdded(b.getDateAdded())
                .build();
    }
}
