package com.nehrem.backend.repository;

import com.nehrem.backend.entity.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Long> {

    /** FIFO: all batches with remaining stock, oldest first. */
    List<InventoryBatch> findByProductIdAndQuantityGreaterThanOrderByDateAddedAsc(Long productId, int quantity);

    /** All batches for a product, oldest first. */
    List<InventoryBatch> findByProductIdOrderByDateAddedAsc(Long productId);

    /** Latest batch price (for displaying current purchase price on product). */
    Optional<InventoryBatch> findTopByProductIdOrderByDateAddedDesc(Long productId);

    /** Total value of all inventory across all products and batches. */
    @Query("SELECT COALESCE(SUM(b.purchasePrice * b.quantity), 0) FROM InventoryBatch b WHERE b.quantity > 0")
    BigDecimal totalInventoryValue();

    void deleteByProductId(Long productId);
}
