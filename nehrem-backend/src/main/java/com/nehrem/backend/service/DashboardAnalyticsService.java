package com.nehrem.backend.service;

import com.nehrem.backend.dto.AnalyticsDTO;

import java.util.Map;

public interface DashboardAnalyticsService {
    AnalyticsDTO.Stats getStats();
    AnalyticsDTO.ChartData getChartData(int days);
    /** Returns order count per status, e.g. {"PENDING": 5, "ACCEPTED": 3, …}. */
    Map<String, Long> getOrderStatusCounts();
}
