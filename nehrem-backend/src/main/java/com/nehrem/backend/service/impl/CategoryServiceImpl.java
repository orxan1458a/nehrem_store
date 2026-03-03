package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.CategoryDTO;
import com.nehrem.backend.entity.Category;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.CategoryRepository;
import com.nehrem.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO.Response> getAll() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO.Response getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public CategoryDTO.Response create(CategoryDTO.Request request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException("Category with name '" + request.getName() + "' already exists");
        }
        Category category = Category.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .build();
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryDTO.Response update(Long id, CategoryDTO.Request request) {
        Category category = findById(id);
        categoryRepository.findByNameIgnoreCase(request.getName())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw new BusinessException("Category name already in use"); });

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(Long id) {
        Category category = findById(id);
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new BusinessException("Cannot delete category that has products assigned");
        }
        categoryRepository.delete(category);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    private CategoryDTO.Response toResponse(Category c) {
        return CategoryDTO.Response.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
