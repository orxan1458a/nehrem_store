package com.nehrem.backend.service;

import com.nehrem.backend.dto.SettingDTO;
import org.springframework.web.multipart.MultipartFile;

public interface SettingService {
    SettingDTO.Response getLogo();
    SettingDTO.Response updateLogoUrl(String url);
    SettingDTO.Response uploadLogo(MultipartFile file);
}
