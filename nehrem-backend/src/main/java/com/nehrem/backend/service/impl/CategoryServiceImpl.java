package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.CategoryDTO;
import com.nehrem.backend.entity.Category;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.exception.ResourceNotFoundException;
import com.nehrem.backend.repository.CategoryRepository;
import com.nehrem.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

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
    public CategoryDTO.Response create(CategoryDTO.Request request, MultipartFile icon) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException("Category with name '" + request.getName() + "' already exists");
        }
        Category category = Category.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .build();

        if (icon != null && !icon.isEmpty()) {
            category.setIconUrl(saveFile(icon));
        }

        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryDTO.Response update(Long id, CategoryDTO.Request request, MultipartFile icon, boolean removeIcon) {
        Category category = findById(id);
        categoryRepository.findByNameIgnoreCase(request.getName())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw new BusinessException("Category name already in use"); });

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());

        if (icon != null && !icon.isEmpty()) {
            deleteFile(category.getIconUrl());
            category.setIconUrl(saveFile(icon));
        } else if (removeIcon) {
            deleteFile(category.getIconUrl());
            category.setIconUrl(null);
        }

        return toResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(Long id) {
        Category category = findById(id);
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new BusinessException("Cannot delete category that has products assigned");
        }
        deleteFile(category.getIconUrl());
        categoryRepository.delete(category);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    private String saveFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalFilename = StringUtils.cleanPath(
                    Objects.requireNonNull(file.getOriginalFilename()));
            String extension = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String fileName = UUID.randomUUID() + extension;

            Files.copy(file.getInputStream(),
                    uploadPath.resolve(fileName),
                    StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new BusinessException("Could not save icon: " + ex.getMessage());
        }
    }

    private void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}
    }

    private CategoryDTO.Response toResponse(Category c) {
        return CategoryDTO.Response.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .iconUrl(c.getIconUrl())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
