package com.nehrem.backend.controller;

import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.dto.ProductDTO;
import com.nehrem.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    @Autowired
    private  ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO.Response>>> getAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<ProductDTO.Response> products = productService.getAll(
                categoryId, search, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/admin-list")
    public ResponseEntity<ApiResponse<Page<ProductDTO.Response>>> getAllAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<ProductDTO.Response> products = productService.getAllAdmin(
                search, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDTO.Response>> create(
            @Valid @RequestPart("product") ProductDTO.Request request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Product created successfully",
                        productService.create(request, image)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDTO.Response>> update(
            @PathVariable Long id,
            @Valid @RequestPart("product") ProductDTO.Request request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully",
                productService.update(id, request, image)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deleted successfully", null));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<Void>> toggleActive(@PathVariable Long id) {
        productService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.ok("Product status toggled", null));
    }

    @GetMapping("/flash-sale")
    public ResponseEntity<ApiResponse<List<ProductDTO.Response>>> getFlashSale() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getFlashSaleProducts()));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> incrementView(
            @PathVariable Long id,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId) {
        productService.incrementView(id, deviceId);
        return ResponseEntity.ok(ApiResponse.ok("View counted", null));
    }
}
