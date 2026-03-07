package com.nehrem.backend.service;

import com.nehrem.backend.dto.AnalyticsDTO;

public interface DashboardAnalyticsService {
    AnalyticsDTO.Stats getStats();
    AnalyticsDTO.ChartData getChartData(int days);
}
