package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.SettingDTO;
import com.nehrem.backend.entity.AppSetting;
import com.nehrem.backend.exception.BusinessException;
import com.nehrem.backend.repository.AppSettingRepository;
import com.nehrem.backend.service.SettingService;
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

@Service
@RequiredArgsConstructor
@Transactional
public class SettingServiceImpl implements SettingService {

    private static final String LOGO_KEY = "app_logo";
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".png", ".jpg", ".jpeg", ".svg", ".webp");
    private static final long MAX_SIZE_BYTES = 2L * 1024 * 1024; // 2 MB

    private final AppSettingRepository settingRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Override
    @Transactional(readOnly = true)
    public SettingDTO.Response getLogo() {
        return settingRepository.findByKey(LOGO_KEY)
                .map(this::toResponse)
                .orElse(SettingDTO.Response.builder().key(LOGO_KEY).value(null).build());
    }

    @Override
    public SettingDTO.Response updateLogoUrl(String url) {
        AppSetting setting = settingRepository.findByKey(LOGO_KEY)
                .orElse(AppSetting.builder().key(LOGO_KEY).build());
        setting.setValue(url);
        return toResponse(settingRepository.save(setting));
    }

    @Override
    public SettingDTO.Response uploadLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is required");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException("File size must be less than 2MB");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase()
                : "";

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException("Only PNG, JPG, SVG, and WEBP files are allowed");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // Delete previous managed logo file
            settingRepository.findByKey(LOGO_KEY).ifPresent(s -> deleteFile(s.getValue()));

            String fileName = "logo_" + UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

            return updateLogoUrl("/uploads/" + fileName);
        } catch (IOException ex) {
            throw new BusinessException("Could not save logo: " + ex.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────

    private void deleteFile(String url) {
        if (url == null || url.isBlank() || !url.startsWith("/uploads/")) return;
        try {
            String filename = url.substring(url.lastIndexOf('/') + 1);
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}
    }

    private SettingDTO.Response toResponse(AppSetting s) {
        return SettingDTO.Response.builder()
                .key(s.getKey())
                .value(s.getValue())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
