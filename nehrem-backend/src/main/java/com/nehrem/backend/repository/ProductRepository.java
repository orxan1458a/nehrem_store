package com.nehrem.backend.repository;

import com.nehrem.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
          AND (:categoryId IS NULL OR p.category.id = :categoryId)
          AND (:search IS NULL OR :search = ''
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Product> findByFilters(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            Pageable pageable
    );

    List<Product> findByCategoryId(Long categoryId);

    @Query("""
        SELECT p FROM Product p LEFT JOIN p.category c
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR str(p.id) = :search)
    """)
    Page<Product> findAllByFiltersAdmin(
            @Param("search") String search,
            Pageable pageable
    );
}
