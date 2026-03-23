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

    /** Public — anyone can fetch the current logo URL */
    @GetMapping("/logo")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> getLogo() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getLogo()));
    }

    /** Admin only — update logo by providing a URL directly */
    @PutMapping("/logo")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> updateLogoUrl(
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Logo updated", settingService.updateLogoUrl(body.get("value"))));
    }

    /** Admin only — upload logo image file */
    @PostMapping("/logo/upload")
    public ResponseEntity<ApiResponse<SettingDTO.Response>> uploadLogo(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok("Logo uploaded", settingService.uploadLogo(file)));
    }
}
