package com.nehrem.backend.repository;

import com.nehrem.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // ── Analytics ────────────────────────────────────────────────────────────

    long countByStatus(Order.OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> 'CANCELLED'")
    BigDecimal sumRevenue();

    @Query("SELECT COUNT(DISTINCT o.phone) FROM Order o")
    long countDistinctCustomers();

    /** Orders per day — returns [date_str, count] */
    @Query(value = """
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS cnt
        FROM orders
        WHERE created_at >= :since
        GROUP BY d
        ORDER BY d
        """, nativeQuery = true)
    List<Object[]> countOrdersByDate(@Param("since") LocalDateTime since);

    /** Revenue per day — returns [date_str, sum] */
    @Query(value = """
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, SUM(total_amount) AS rev
        FROM orders
        WHERE created_at >= :since AND status <> 'CANCELLED'
        GROUP BY d
        ORDER BY d
        """, nativeQuery = true)
    List<Object[]> revenueByDate(@Param("since") LocalDateTime since);

    /** Count by status — returns [status_str, count] */
    @Query(value = "SELECT status, COUNT(*) FROM orders GROUP BY status", nativeQuery = true)
    List<Object[]> countByStatusNative();

    /** Top N products by quantity sold — returns [product_name, total_qty] */
    @Query(value = """
        SELECT oi.product_name, SUM(oi.quantity) AS total
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status <> 'CANCELLED'
        GROUP BY oi.product_name
        ORDER BY total DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> topProductsByQuantity(@Param("limit") int limit);
}
