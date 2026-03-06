package com.nehrem.backend.service;

import com.nehrem.backend.dto.CategoryDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategoryService {
    List<CategoryDTO.Response> getAll();
    CategoryDTO.Response getById(Long id);
    CategoryDTO.Response create(CategoryDTO.Request request, MultipartFile icon);
    CategoryDTO.Response update(Long id, CategoryDTO.Request request, MultipartFile icon, boolean removeIcon);
    void delete(Long id);
}
