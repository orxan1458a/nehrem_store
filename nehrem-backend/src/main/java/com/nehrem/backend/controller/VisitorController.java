package com.nehrem.backend.controller;

import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.dto.DashboardStatsDTO;
import com.nehrem.backend.dto.VisitorPingRequest;
import com.nehrem.backend.service.VisitorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorService visitorService;

    @PostMapping("/ping")
    public ResponseEntity<ApiResponse<Void>> ping(
            @Valid @RequestBody VisitorPingRequest request,
            HttpServletRequest httpRequest) {

        String ip        = resolveClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        visitorService.ping(request.getDeviceId(), ip, userAgent);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(visitorService.getStats()));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
