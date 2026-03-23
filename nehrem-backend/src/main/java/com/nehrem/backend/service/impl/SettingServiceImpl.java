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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SettingServiceImpl implements SettingService {

    private static final String LOGO_KEY              = "app_logo";
    private static final String APP_NAME_KEY          = "app_name";
    private static final String FAVICON_KEY           = "favicon";
    private static final String HOMEPAGE_LIMIT_KEY    = "homepage_discount_limit";
    private static final String CONTACT_PHONE_KEY     = "contact_phone";
    private static final String CONTACT_EMAIL_KEY     = "contact_email";
    private static final String SOCIAL_TIKTOK_KEY     = "social_tiktok";
    private static final String SOCIAL_INSTAGRAM_KEY  = "social_instagram";
    private static final String SOCIAL_TELEGRAM_KEY   = "social_telegram";
    private static final String CONTACT_PHONE_VISIBLE_KEY    = "contact_phone_visible";
    private static final String CONTACT_EMAIL_VISIBLE_KEY    = "contact_email_visible";
    private static final String SOCIAL_TIKTOK_VISIBLE_KEY    = "social_tiktok_visible";
    private static final String SOCIAL_INSTAGRAM_VISIBLE_KEY = "social_instagram_visible";
    private static final String SOCIAL_TELEGRAM_VISIBLE_KEY  = "social_telegram_visible";
    private static final int    DEFAULT_HOMEPAGE_LIMIT = 5;

    private static final List<String> LOGO_EXTENSIONS    = List.of(".png", ".jpg", ".jpeg", ".svg", ".webp");
    private static final List<String> FAVICON_EXTENSIONS = List.of(".ico", ".png");

    private static final long LOGO_MAX_BYTES    = 2L * 1024 * 1024; // 2 MB
    private static final long FAVICON_MAX_BYTES = 1L * 1024 * 1024; // 1 MB

    private final AppSettingRepository settingRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    // ── Logo ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SettingDTO.Response getLogo() {
        return getOrEmpty(LOGO_KEY);
    }

    @Override
    public SettingDTO.Response updateLogoUrl(String url) {
        return upsert(LOGO_KEY, url);
    }

    @Override
    public SettingDTO.Response uploadLogo(MultipartFile file) {
        validateFile(file, LOGO_EXTENSIONS, LOGO_MAX_BYTES, "Logo");
        String url = saveFile(file, LOGO_KEY, "logo_");
        return upsert(LOGO_KEY, url);
    }

    // ── App Name ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SettingDTO.Response getAppName() {
        return getOrDefault(APP_NAME_KEY, "EvTrend");
    }

    @Override
    public SettingDTO.Response updateAppName(String name) {
        if (name == null || name.isBlank()) {
            throw new BusinessException("App name cannot be empty");
        }
        return upsert(APP_NAME_KEY, name.trim());
    }

    // ── Favicon ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SettingDTO.Response getFavicon() {
        return getOrEmpty(FAVICON_KEY);
    }

    @Override
    public SettingDTO.Response uploadFavicon(MultipartFile file) {
        validateFile(file, FAVICON_EXTENSIONS, FAVICON_MAX_BYTES, "Favicon");
        String url = saveFile(file, FAVICON_KEY, "favicon_");
        return upsert(FAVICON_KEY, url);
    }

    // ── Homepage ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SettingDTO.HomepageSettings getHomepageSettings() {
        int limit = settingRepository.findByKey(HOMEPAGE_LIMIT_KEY)
                .map(s -> {
                    try { return Integer.parseInt(s.getValue()); }
                    catch (NumberFormatException e) { return DEFAULT_HOMEPAGE_LIMIT; }
                })
                .orElse(DEFAULT_HOMEPAGE_LIMIT);
        return SettingDTO.HomepageSettings.builder()
                .homepageDiscountLimit(limit)
                .build();
    }

    @Override
    public SettingDTO.Response updateHomepageDiscountLimit(int limit) {
        if (limit < 1) throw new BusinessException("Limit must be at least 1");
        return upsert(HOMEPAGE_LIMIT_KEY, String.valueOf(limit));
    }

    // ── Contact / Social ─────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SettingDTO.ContactSettings getContactSettings() {
        return SettingDTO.ContactSettings.builder()
                .phone(getValue(CONTACT_PHONE_KEY))
                .phoneVisible(getBoolValue(CONTACT_PHONE_VISIBLE_KEY, true))
                .email(getValue(CONTACT_EMAIL_KEY))
                .emailVisible(getBoolValue(CONTACT_EMAIL_VISIBLE_KEY, true))
                .tiktok(getValue(SOCIAL_TIKTOK_KEY))
                .tiktokVisible(getBoolValue(SOCIAL_TIKTOK_VISIBLE_KEY, true))
                .instagram(getValue(SOCIAL_INSTAGRAM_KEY))
                .instagramVisible(getBoolValue(SOCIAL_INSTAGRAM_VISIBLE_KEY, true))
                .telegram(getValue(SOCIAL_TELEGRAM_KEY))
                .telegramVisible(getBoolValue(SOCIAL_TELEGRAM_VISIBLE_KEY, true))
                .build();
    }

    @Override
    public SettingDTO.ContactSettings updateContactSettings(SettingDTO.ContactSettings dto) {
        upsert(CONTACT_PHONE_KEY,            dto.getPhone());
        upsert(CONTACT_PHONE_VISIBLE_KEY,    String.valueOf(dto.isPhoneVisible()));
        upsert(CONTACT_EMAIL_KEY,            dto.getEmail());
        upsert(CONTACT_EMAIL_VISIBLE_KEY,    String.valueOf(dto.isEmailVisible()));
        upsert(SOCIAL_TIKTOK_KEY,            dto.getTiktok());
        upsert(SOCIAL_TIKTOK_VISIBLE_KEY,    String.valueOf(dto.isTiktokVisible()));
        upsert(SOCIAL_INSTAGRAM_KEY,         dto.getInstagram());
        upsert(SOCIAL_INSTAGRAM_VISIBLE_KEY, String.valueOf(dto.isInstagramVisible()));
        upsert(SOCIAL_TELEGRAM_KEY,          dto.getTelegram());
        upsert(SOCIAL_TELEGRAM_VISIBLE_KEY,  String.valueOf(dto.isTelegramVisible()));
        return getContactSettings();
    }

    // ── Shared helpers ────────────────────────────────────────────────────────

    private String getValue(String key) {
        return settingRepository.findByKey(key)
                .map(AppSetting::getValue)
                .orElse(null);
    }

    private boolean getBoolValue(String key, boolean defaultValue) {
        return settingRepository.findByKey(key)
                .map(s -> Boolean.parseBoolean(s.getValue()))
                .orElse(defaultValue);
    }

    private SettingDTO.Response getOrEmpty(String key) {
        return settingRepository.findByKey(key)
                .map(this::toResponse)
                .orElse(SettingDTO.Response.builder().key(key).value(null).build());
    }

    private SettingDTO.Response getOrDefault(String key, String defaultValue) {
        return settingRepository.findByKey(key)
                .map(this::toResponse)
                .orElse(SettingDTO.Response.builder().key(key).value(defaultValue).build());
    }

    private SettingDTO.Response upsert(String key, String value) {
        AppSetting setting = settingRepository.findByKey(key)
                .orElse(AppSetting.builder().key(key).build());
        setting.setValue(value);
        return toResponse(settingRepository.save(setting));
    }

    private void validateFile(MultipartFile file, List<String> allowedExts, long maxBytes, String label) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(label + " file is required");
        }
        if (file.getSize() > maxBytes) {
            throw new BusinessException(label + " file must be less than " + (maxBytes / 1024 / 1024) + "MB");
        }
        String ext = extension(file.getOriginalFilename());
        if (!allowedExts.contains(ext)) {
            throw new BusinessException(label + " must be one of: " + String.join(", ", allowedExts));
        }
    }

    /** Saves the file, deletes the old one for the given key, returns the URL path. */
    private String saveFile(MultipartFile file, String key, String prefix) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            settingRepository.findByKey(key).ifPresent(s -> deleteFile(s.getValue()));

            String fileName = prefix + UUID.randomUUID() + extension(file.getOriginalFilename());
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new BusinessException("Could not save file: " + ex.getMessage());
        }
    }

    private void deleteFile(String url) {
        if (url == null || url.isBlank() || !url.startsWith("/uploads/")) return;
        try {
            String filename = url.substring(url.lastIndexOf('/') + 1);
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}
    }

    private String extension(String filename) {
        if (filename == null || filename.isBlank()) return "";
        String clean = StringUtils.cleanPath(filename);
        return clean.contains(".")
                ? clean.substring(clean.lastIndexOf('.')).toLowerCase()
                : "";
    }

    private SettingDTO.Response toResponse(AppSetting s) {
        return SettingDTO.Response.builder()
                .key(s.getKey())
                .value(s.getValue())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
