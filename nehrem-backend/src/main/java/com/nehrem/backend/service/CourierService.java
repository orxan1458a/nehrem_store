package com.nehrem.backend.service;

import com.nehrem.backend.dto.CourierDTO;
import com.nehrem.backend.dto.OrderDTO;

import java.util.List;

public interface CourierService {
    List<CourierDTO.Response> getAll();
    List<OrderDTO.CourierInfo> getActive();
    CourierDTO.Response create(CourierDTO.Request request);
    CourierDTO.Response update(Long id, CourierDTO.Request request);
    CourierDTO.Response toggleActive(Long id);
    void delete(Long id);
}
