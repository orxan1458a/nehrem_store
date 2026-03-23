package com.nehrem.backend.controller;

import com.nehrem.backend.dto.ApiResponse;
import com.nehrem.backend.dto.SettingDTO;
import com.nehrem.backend.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settingService;

    // ── Logo ─────────────────────────────────────────────────────────────────

    @GetMapping("/logo")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> getLogo() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getLogo()));
    }

    @PutMapping("/logo")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> updateLogoUrl(
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Logo updated", settingService.updateLogoUrl(body.get("value"))));
    }

    @PostMapping("/logo/upload")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> uploadLogo(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok("Logo uploaded", settingService.uploadLogo(file)));
    }

    // ── App Name ─────────────────────────────────────────────────────────────

    @GetMapping("/app-name")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> getAppName() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getAppName()));
    }

    @PutMapping("/app-name")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> updateAppName(
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("App name updated", settingService.updateAppName(body.get("value"))));
    }

    // ── Favicon ──────────────────────────────────────────────────────────────

    @GetMapping("/favicon")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> getFavicon() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getFavicon()));
    }

    @PostMapping("/favicon/upload")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> uploadFavicon(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok("Favicon uploaded", settingService.uploadFavicon(file)));
    }

    // ── Homepage ──────────────────────────────────────────────────────────────

    @GetMapping("/homepage")
    public ResponseEntity<ApiResponse<SettingDTO.HomepageSettings>> getHomepageSettings() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getHomepageSettings()));
    }

    @PutMapping("/homepage/discount-limit")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> updateHomepageDiscountLimit(
            @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(ApiResponse.ok("Limit updated",
                settingService.updateHomepageDiscountLimit(body.getOrDefault("value", 5))));
    }

    // ── Contact / Social ──────────────────────────────────────────────────────

    @GetMapping("/contact")
    public ResponseEntity<ApiResponse<SettingDTO.ContactSettings>> getContact() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getContactSettings()));
    }

    @PutMapping("/contact")
    public ResponseEntity<ApiResponse<SettingDTO.ContactSettings>> updateContact(
            @RequestBody SettingDTO.ContactSettings dto) {
        return ResponseEntity.ok(ApiResponse.ok("Contact settings updated",
                settingService.updateContactSettings(dto)));
    }
}
