package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.AnalyticsDTO;
import com.nehrem.backend.entity.Order;
import com.nehrem.backend.repository.OrderRepository;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.service.DashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardAnalyticsServiceImpl implements DashboardAnalyticsService {

    private final OrderRepository   orderRepository;
    private final ProductRepository productRepository;

    @Override
    public AnalyticsDTO.Stats getStats() {
        BigDecimal revenue = orderRepository.sumRevenue();
        return AnalyticsDTO.Stats.builder()
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByStatus(Order.OrderStatus.PENDING))
                .acceptedOrders(orderRepository.countByStatus(Order.OrderStatus.ACCEPTED))
                .deliveredOrders(orderRepository.countByStatus(Order.OrderStatus.DELIVERED))
                .cancelledOrders(orderRepository.countByStatus(Order.OrderStatus.CANCELLED))
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .totalProducts(productRepository.count())
                .totalCustomers(orderRepository.countDistinctCustomers())
                .build();
    }

    @Override
    public AnalyticsDTO.ChartData getChartData(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        List<AnalyticsDTO.DataPoint> ordersByDate = orderRepository.countOrdersByDate(since)
                .stream()
                .map(row -> AnalyticsDTO.DataPoint.builder()
                        .label(row[0].toString())
                        .value(((Number) row[1]).doubleValue())
                        .build())
                .toList();

        List<AnalyticsDTO.DataPoint> revenueByDate = orderRepository.revenueByDate(since)
                .stream()
                .map(row -> AnalyticsDTO.DataPoint.builder()
                        .label(row[0].toString())
                        .value(row[1] != null ? ((Number) row[1]).doubleValue() : 0.0)
                        .build())
                .toList();

        List<AnalyticsDTO.StatusCount> orderStatus = orderRepository.countByStatusNative()
                .stream()
                .map(row -> AnalyticsDTO.StatusCount.builder()
                        .status(row[0].toString())
                        .count(((Number) row[1]).longValue())
                        .build())
                .toList();

        List<AnalyticsDTO.ProductSale> topProducts = orderRepository.topProductsByQuantity()
                .stream()
                .map(row -> AnalyticsDTO.ProductSale.builder()
                        .name(row[0].toString())
                        .quantity(((Number) row[1]).longValue())
                        .build())
                .toList();

        return AnalyticsDTO.ChartData.builder()
                .ordersByDate(ordersByDate)
                .revenueByDate(revenueByDate)
                .orderStatus(orderStatus)
                .topProducts(topProducts)
                .build();
    }
}
