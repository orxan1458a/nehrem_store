package com.nehrem.backend.service;

import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderDTO.Response create(OrderDTO.Request request);
    Page<OrderDTO.Response> getAll(Pageable pageable);
    Page<OrderDTO.Response> getAllByStatus(Order.OrderStatus status, Pageable pageable);
    OrderDTO.Response getById(Long id);
    OrderDTO.Response updateStatus(Long id, Order.OrderStatus status);
    OrderDTO.Response acceptOrder(Long id, Long courierId);
    OrderDTO.Response cancelOrder(Long id);
    OrderDTO.Response assignCourier(Long id, Long courierId);
    Page<OrderDTO.Response> getCourierOrders(Long courierId, Pageable pageable);
    OrderDTO.Response markOutForDelivery(Long orderId, Long courierId);
    OrderDTO.Response markDelivered(Long orderId, Long courierId);
    OrderDTO.Response markFailAttempt(Long orderId, Long courierId, String reason);
    OrderDTO.Response adminMarkFailAttempt(Long id, String reason);
}
