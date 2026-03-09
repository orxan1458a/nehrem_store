package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.entity.Order;
import com.nehrem.backend.entity.OrderItem;
import com.nehrem.backend.entity.Product;
import com.nehrem.backend.entity.User;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.OrderRepository;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.repository.UserRepository;
import com.nehrem.backend.service.InventoryService;
import com.nehrem.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository   orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository    userRepository;
    private final InventoryService  inventoryService;

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

            // FIFO stock deduction — returns total purchase cost for this item
            BigDecimal purchaseCost = inventoryService.deductFifo(
                    product.getId(), itemReq.getQuantity());

            orderItems.add(OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .purchaseCost(purchaseCost)
                    .build());
        }

        Order order = Order.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .deliveryMethod(request.getDeliveryMethod())
                .address(request.getAddress())
                .totalAmount(totalAmount)
                .notes(request.getNotes())
                .orderStatus(Order.OrderStatus.PENDING)
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
    public Page<OrderDTO.Response> getAllByStatus(Order.OrderStatus orderStatus, Pageable pageable) {
        return orderRepository.findByOrderStatusOrderByCreatedAtDesc(orderStatus, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO.Response getById(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id)));
    }

    @Override
    public OrderDTO.Response updateStatus(Long id, Order.OrderStatus orderStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        if (orderStatus == Order.OrderStatus.CANCELLED
                && order.getOrderStatus() != Order.OrderStatus.CANCELLED) {
            returnStockForOrder(order);
        }
        order.setOrderStatus(orderStatus);
        return toResponse(orderRepository.save(order));
    }

    @Override
    public OrderDTO.Response acceptOrder(Long id, Long courierId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setOrderStatus(Order.OrderStatus.ACCEPTED);
        if (courierId != null) {
            User courier = userRepository.findById(courierId)
                    .orElseThrow(() -> new ResourceNotFoundException("Courier", courierId));
            order.setCourier(courier);
        }
        return toResponse(orderRepository.save(order));
    }

    @Override
    public OrderDTO.Response cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        if (order.getOrderStatus() == Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Order is already cancelled");
        }
        returnStockForOrder(order);
        order.setOrderStatus(Order.OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    @Override
    public OrderDTO.Response assignCourier(Long id, Long courierId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        if (courierId == null) {
            order.setCourier(null);
        } else {
            User courier = userRepository.findById(courierId)
                    .orElseThrow(() -> new ResourceNotFoundException("Courier", courierId));
            order.setCourier(courier);
        }
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO.Response> getCourierOrders(Long courierId, Pageable pageable) {
        return orderRepository
                .findByCourierIdAndOrderStatusOrderByCreatedAtDesc(courierId, Order.OrderStatus.ACCEPTED, pageable)
                .map(this::toResponse);
    }

    @Override
    public OrderDTO.Response markDelivered(Long orderId, Long courierId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (order.getCourier() == null || !order.getCourier().getId().equals(courierId)) {
            throw new BusinessException("This order is not assigned to you");
        }
        if (order.getOrderStatus() != Order.OrderStatus.ACCEPTED) {
            throw new BusinessException("Only ACCEPTED orders can be marked as delivered");
        }
        order.setOrderStatus(Order.OrderStatus.DELIVERED);
        return toResponse(orderRepository.save(order));
    }

    // ── Helpers ──────────────────────────────────────────────

    /**
     * Returns stock for all items in the order using the stored per-unit purchase price.
     * Creates a new inventory batch per item so the returned stock enters back into FIFO.
     */
    private void returnStockForOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            BigDecimal avgPurchasePrice = BigDecimal.ZERO;
            if (item.getPurchaseCost() != null && item.getQuantity() > 0) {
                avgPurchasePrice = item.getPurchaseCost()
                        .divide(BigDecimal.valueOf(item.getQuantity()), 2, RoundingMode.HALF_UP);
            }
            inventoryService.returnStock(
                    item.getProduct().getId(), item.getQuantity(), avgPurchasePrice);
        }
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
                .orderStatus(o.getOrderStatus())
                .notes(o.getNotes())
                .courier(courierInfo)
                .items(items)
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
