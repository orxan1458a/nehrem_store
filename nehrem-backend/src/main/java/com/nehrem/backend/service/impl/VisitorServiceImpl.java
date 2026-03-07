package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.DashboardStatsDTO;
import com.nehrem.backend.entity.Visitor;
import com.nehrem.backend.repository.OrderRepository;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.repository.VisitorRepository;
import com.nehrem.backend.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class VisitorServiceImpl implements VisitorService {

    private final VisitorRepository visitorRepository;
    private final OrderRepository   orderRepository;
    private final ProductRepository productRepository;

    @Override
    public void ping(String deviceId, String ipAddress, String userAgent) {
        Visitor visitor = visitorRepository.findByDeviceId(deviceId)
                .orElseGet(() -> Visitor.builder().deviceId(deviceId).build());

        visitor.setLastActivity(LocalDateTime.now());
        if (ipAddress != null && !ipAddress.isBlank()) {
            visitor.setIpAddress(ipAddress);
        }
        if (userAgent != null && !userAgent.isBlank()) {
            visitor.setUserAgent(userAgent);
        }

        visitorRepository.save(visitor);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        LocalDateTime startOfDay     = LocalDate.now().atStartOfDay();

        return DashboardStatsDTO.builder()
                .totalVisitors(visitorRepository.count())
                .activeVisitors(visitorRepository.countActive(fiveMinutesAgo))
                .todayVisitors(visitorRepository.countToday(startOfDay))
                .totalOrders(orderRepository.count())
                .totalProducts(productRepository.count())
                .build();
    }
}
