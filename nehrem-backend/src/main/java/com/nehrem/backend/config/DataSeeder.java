package com.nehrem.backend.config;

import com.nehrem.backend.entity.User;
import com.nehrem.backend.repository.ProductRepository;
import com.nehrem.backend.repository.UserRepository;
import com.nehrem.backend.service.ExternalDataSeederService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository         userRepository;
    private final PasswordEncoder        passwordEncoder;
    private final ProductRepository      productRepository;
    private final ExternalDataSeederService externalDataSeederService;

    @Override
    public void run(String... args) {

        // ── Seed admin user ────────────────────────────────────────────────────
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .role(User.Role.ADMIN)
                    .name("Admin")
                    .active(true)
                    .build());
            log.info("Default admin user created.");
        }

        // ── Seed products from external API (only when DB is empty) ────────────
        if (productRepository.count() == 0) {
            log.info("No products found — seeding from external API...");
            try {
                String seedResult = externalDataSeederService.seedFromExternalApi();
                log.info("Auto-seed result: {}", seedResult);

                // Download images to local storage right after seeding
                String imageResult = externalDataSeederService.syncProductImages();
                log.info("Auto image sync result: {}", imageResult);
            } catch (Exception ex) {
                // Non-fatal: the app starts normally even if seeding fails
                log.warn("Auto-seed from external API failed (app continues): {}", ex.getMessage());
            }
        } else {
            log.info("Products already present — skipping auto-seed.");
        }
    }
}
