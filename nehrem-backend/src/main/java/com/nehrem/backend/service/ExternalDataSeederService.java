package com.nehrem.backend.service;

/**
 * Fetches product data from an external public API (DummyJSON)
 * and populates the database with Categories, Products,
 * InventoryBatches, and Reviews.
 */
public interface ExternalDataSeederService {

    /**
     * Run the full seeding pipeline.
     * Safe to call multiple times — skips products and categories
     * that already exist (idempotent).
     *
     * @return a human-readable summary of what was created
     */
    String seedFromExternalApi();

    /**
     * Downloads the external thumbnail URL of every product whose imageUrl
     * still points to an http/https address, saves the file to ./uploads/,
     * and updates the product's imageUrl to the local /uploads/{filename} path.
     *
     * Safe to re-run — products already pointing to /uploads/ are skipped.
     *
     * @return a human-readable summary of how many images were downloaded
     */
    String syncProductImages();
}
