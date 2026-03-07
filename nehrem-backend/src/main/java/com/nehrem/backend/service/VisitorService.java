package com.nehrem.backend.service;

import com.nehrem.backend.dto.DashboardStatsDTO;

public interface VisitorService {
    void ping(String deviceId, String ipAddress, String userAgent);
    DashboardStatsDTO getStats();
}
