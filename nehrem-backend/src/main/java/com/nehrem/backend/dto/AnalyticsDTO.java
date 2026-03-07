package com.nehrem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class AnalyticsDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Stats {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long processingOrders;
        private long completedOrders;
        private long cancelledOrders;
        private BigDecimal totalRevenue;
        private long totalProducts;
        private long totalCustomers;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DataPoint {
        private String label;
        private double value;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProductSale {
        private String name;
        private long quantity;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private long count;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChartData {
        private List<DataPoint> ordersByDate;
        private List<DataPoint> revenueByDate;
        private List<StatusCount> orderStatus;
        private List<ProductSale> topProducts;
    }
}
