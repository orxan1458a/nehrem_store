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

    Page<Order> findByOrderStatusOrderByCreatedAtDesc(Order.OrderStatus orderStatus, Pageable pageable);

    Page<Order> findByCourierIdAndOrderStatusOrderByCreatedAtDesc(Long courierId, Order.OrderStatus orderStatus, Pageable pageable);

    Page<Order> findByCourierIdOrderByCreatedAtDesc(Long courierId, Pageable pageable);

    // ── Analytics ────────────────────────────────────────────────────────────

    long countByOrderStatus(Order.OrderStatus orderStatus);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus <> 'CANCELLED'")
    BigDecimal sumRevenue();

    @Query("SELECT COUNT(DISTINCT o.phone) FROM Order o")
    long countDistinctCustomers();

    @Query(value = """
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS cnt
        FROM orders WHERE created_at >= :since
        GROUP BY d ORDER BY d
        """, nativeQuery = true)
    List<Object[]> countOrdersByDate(@Param("since") LocalDateTime since);

    @Query(value = """
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, SUM(total_amount) AS rev
        FROM orders WHERE created_at >= :since AND order_status <> 'CANCELLED'
        GROUP BY d ORDER BY d
        """, nativeQuery = true)
    List<Object[]> revenueByDate(@Param("since") LocalDateTime since);

    @Query(value = "SELECT order_status, COUNT(*) FROM orders GROUP BY order_status", nativeQuery = true)
    List<Object[]> countByStatusNative();

    @Query(value = "SELECT oi.product_name, SUM(oi.quantity) AS total FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.order_status <> 'CANCELLED' GROUP BY oi.product_name ORDER BY total DESC LIMIT 10", nativeQuery = true)
    List<Object[]> topProductsByQuantity();

    // ── Profit / COGS analytics (DELIVERED orders only) ──────────────────────

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus = 'DELIVERED'")
    BigDecimal sumDeliveredRevenue();

    @Query("SELECT COALESCE(SUM(i.purchaseCost), 0) FROM OrderItem i WHERE i.order.orderStatus = 'DELIVERED'")
    BigDecimal sumDeliveredCOGS();

    @Query(value = """
        SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') AS d,
               SUM(o.total_amount) AS rev,
               COALESCE(SUM(oi_agg.cost), 0) AS cogs
        FROM orders o
        LEFT JOIN (
            SELECT order_id, SUM(purchase_cost) AS cost
            FROM order_items GROUP BY order_id
        ) oi_agg ON oi_agg.order_id = o.id
        WHERE o.order_status = 'DELIVERED' AND o.created_at >= :since
        GROUP BY d ORDER BY d
        """, nativeQuery = true)
    List<Object[]> profitByDate(@Param("since") LocalDateTime since);
}
