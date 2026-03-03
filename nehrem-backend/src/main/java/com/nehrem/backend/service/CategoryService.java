package com.nehrem.backend.service;

import com.nehrem.backend.dto.CategoryDTO;

import java.util.List;

public interface CategoryService {
    List<CategoryDTO.Response> getAll();
    CategoryDTO.Response getById(Long id);
    CategoryDTO.Response create(CategoryDTO.Request request);
    CategoryDTO.Response update(Long id, CategoryDTO.Request request);
    void delete(Long id);
}
