package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.entity.Courier;
import com.nehrem.backend.entity.Order;
import com.nehrem.backend.entity.OrderItem;
import com.nehrem.backend.entity.Product;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.CourierRepository;
import com.nehrem.backend.repository.OrderRepository;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository   orderRepository;
    private final ProductRepository productRepository;
    private final CourierRepository courierRepository;

    @Override
    public OrderDTO.Response create(OrderDTO.Request request) {
        if (request.getDeliveryMethod() == Order.DeliveryMethod.DELIVERY
                && (request.getAddress() == null || request.getAddress().isBlank())) {
            throw new BusinessException("Delivery address is required for delivery orders");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderDTO.ItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));

            if (!product.getActive()) {
                throw new BusinessException("Product '" + product.getName() + "' is no longer available");
            }
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new BusinessException("Insufficient stock for product: " + product.getName());
            }

            BigDecimal unitPrice = product.getDiscountPrice() != null
                    ? product.getDiscountPrice()
                    : product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            orderItems.add(OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build());

            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);
        }

        Order order = Order.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .deliveryMethod(request.getDeliveryMethod())
                .address(request.getAddress())
                .totalAmount(totalAmount)
                .notes(request.getNotes())
                .status(Order.OrderStatus.PENDING)
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        order.setItems(orderItems);

        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO.Response> getAll(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO.Response> getAllByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO.Response getById(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id)));
    }

    @Override
    public OrderDTO.Response updateStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    @Override
    public OrderDTO.Response assignCourier(Long id, Long courierId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        if (courierId == null) {
            order.setCourier(null);
        } else {
            Courier courier = courierRepository.findById(courierId)
                    .orElseThrow(() -> new ResourceNotFoundException("Courier", courierId));
            order.setCourier(courier);
        }
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO.Response> getCourierOrders(Long courierId, Pageable pageable) {
        return orderRepository
                .findByCourierIdAndStatusOrderByCreatedAtDesc(courierId, Order.OrderStatus.ACCEPTED, pageable)
                .map(this::toResponse);
    }

    @Override
    public OrderDTO.Response markDelivered(Long orderId, Long courierId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (order.getCourier() == null || !order.getCourier().getId().equals(courierId)) {
            throw new BusinessException("This order is not assigned to you");
        }
        if (order.getStatus() != Order.OrderStatus.ACCEPTED) {
            throw new BusinessException("Only ACCEPTED orders can be marked as delivered");
        }
        order.setStatus(Order.OrderStatus.DELIVERED);
        return toResponse(orderRepository.save(order));
    }

    // ── Mapper ───────────────────────────────────────────────

    private OrderDTO.Response toResponse(Order o) {
        List<OrderDTO.ItemResponse> items = o.getItems().stream()
                .map(i -> OrderDTO.ItemResponse.builder()
                        .productId(i.getProduct().getId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        OrderDTO.CourierInfo courierInfo = null;
        if (o.getCourier() != null) {
            courierInfo = OrderDTO.CourierInfo.builder()
                    .id(o.getCourier().getId())
                    .name(o.getCourier().getName())
                    .phone(o.getCourier().getPhone())
                    .build();
        }

        return OrderDTO.Response.builder()
                .id(o.getId())
                .firstName(o.getFirstName())
                .lastName(o.getLastName())
                .phone(o.getPhone())
                .deliveryMethod(o.getDeliveryMethod())
                .address(o.getAddress())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .notes(o.getNotes())
                .courier(courierInfo)
                .items(items)
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
