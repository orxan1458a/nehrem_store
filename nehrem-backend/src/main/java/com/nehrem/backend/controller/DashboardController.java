package com.nehrem.backend.controller;

import com.nehrem.backend.dto.AnalyticsDTO;
import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.service.DashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardAnalyticsService analyticsService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AnalyticsDTO.Stats>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getStats()));
    }

    @GetMapping("/charts")
    public ResponseEntity<ApiResponse<AnalyticsDTO.ChartData>> getChartData(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getChartData(days)));
    }

    /** GET /api/admin/dashboard/order-counts — lightweight per-status badge data. */
    @GetMapping("/order-counts")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getOrderStatusCounts() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getOrderStatusCounts()));
    }
}
