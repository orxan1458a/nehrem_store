package com.nehrem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class SettingDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String key;
        private String value;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HomepageSettings {
        private int homepageDiscountLimit;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactSettings {
        private String phone;
        private boolean phoneVisible;
        private String email;
        private boolean emailVisible;
        private String tiktok;
        private boolean tiktokVisible;
        private String instagram;
        private boolean instagramVisible;
        private String telegram;
        private boolean telegramVisible;
    }
}
