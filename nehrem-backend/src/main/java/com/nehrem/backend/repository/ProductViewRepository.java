package com.nehrem.backend.repository;

import com.nehrem.backend.entity.ProductView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductViewRepository extends JpaRepository<ProductView, Long> {
    boolean existsByProductIdAndDeviceId(Long productId, String deviceId);
}
