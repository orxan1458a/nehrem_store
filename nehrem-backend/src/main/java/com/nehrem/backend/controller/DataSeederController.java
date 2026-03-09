package com.nehrem.backend.controller;

import com.nehrem.backend.service.ExternalDataSeederService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Admin-only endpoint for triggering external data seeding on demand.
 * Secured under /api/admin/** so only ADMIN role can call it.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/seeder")
@RequiredArgsConstructor
public class DataSeederController {

    private final ExternalDataSeederService seederService;

    /**
     * POST /api/admin/seeder/run
     *
     * Fetches product data from DummyJSON and populates the database.
     * Safe to call multiple times — duplicate products are skipped.
     */
    @PostMapping("/run")
    public ResponseEntity<Map<String, String>> runSeeder() {
        log.info("Manual seeder triggered via admin endpoint.");
        String result = seederService.seedFromExternalApi();
        return ResponseEntity.ok(Map.of("message", result));
    }

    /**
     * POST /api/admin/seeder/sync-images
     *
     * Downloads all external product thumbnail URLs to ./uploads/ and updates
     * imageUrl to the local /uploads/{filename} path.
     * Products already pointing to /uploads/ are skipped (idempotent).
     */
    @PostMapping("/sync-images")
    public ResponseEntity<Map<String, String>> syncImages() {
        log.info("Image sync triggered via admin endpoint.");
        String result = seederService.syncProductImages();
        return ResponseEntity.ok(Map.of("message", result));
    }
}
