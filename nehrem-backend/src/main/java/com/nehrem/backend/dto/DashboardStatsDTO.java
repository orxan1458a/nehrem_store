package com.nehrem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalVisitors;
    private long activeVisitors;
    private long todayVisitors;
    private long totalOrders;
    private long totalProducts;
}
