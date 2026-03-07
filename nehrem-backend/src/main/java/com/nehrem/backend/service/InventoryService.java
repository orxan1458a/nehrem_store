package com.nehrem.backend.service;

import com.nehrem.backend.dto.InventoryDTO;

import java.math.BigDecimal;
import java.util.List;

public interface InventoryService {

    /**
     * FIFO deduction: deducts {@code quantity} units from the oldest batches.
     * Also decrements product.stockQuantity.
     *
     * @return total purchase cost (COGS) of the deducted units; ZERO if no batches exist.
     */
    BigDecimal deductFifo(Long productId, int quantity);

    /**
     * Returns stock back to inventory by creating a new batch.
     * Also increments product.stockQuantity.
     */
    void returnStock(Long productId, int quantity, BigDecimal purchasePrice);

    /**
     * Adds a new inventory batch (admin restock).
     * Increments product.stockQuantity by batch quantity.
     */
    InventoryDTO.BatchResponse addBatch(Long productId, InventoryDTO.AddBatchRequest request);

    /** Lists all batches for a product (oldest first). */
    List<InventoryDTO.BatchResponse> getBatches(Long productId);
}
