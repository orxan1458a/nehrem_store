package com.nehrem.backend.service;

import com.nehrem.backend.dto.SettingDTO;
import org.springframework.web.multipart.MultipartFile;

public interface SettingService {

    // ── Logo ─────────────────────────────────────────────────
    SettingDTO.Response getLogo();
    SettingDTO.Response updateLogoUrl(String url);
    SettingDTO.Response uploadLogo(MultipartFile file);

    // ── App Name ─────────────────────────────────────────────
    SettingDTO.Response getAppName();
    SettingDTO.Response updateAppName(String name);

    // ── Favicon ──────────────────────────────────────────────
    SettingDTO.Response getFavicon();
    SettingDTO.Response uploadFavicon(MultipartFile file);

    // ── Homepage ──────────────────────────────────────────────
    SettingDTO.HomepageSettings getHomepageSettings();
    SettingDTO.Response updateHomepageDiscountLimit(int limit);

    // ── Contact / Social ────────────────────────────────────
    SettingDTO.ContactSettings getContactSettings();
    SettingDTO.ContactSettings updateContactSettings(SettingDTO.ContactSettings dto);
}
