package com.nehrem.backend.service;

import com.nehrem.backend.dto.OrderDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderDTO.Response create(OrderDTO.Request request);
    Page<OrderDTO.Response> getAll(Pageable pageable);
    OrderDTO.Response getById(Long id);
}
