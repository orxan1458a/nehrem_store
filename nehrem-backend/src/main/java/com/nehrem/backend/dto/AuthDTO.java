package com.nehrem.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDTO {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "İstifadəçi adı tələb olunur")
        private String username;

        @NotBlank(message = "Şifrə tələb olunur")
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginResponse {
        private String accessToken;
        private String role;
        private Long   userId;
        private String username;
        private String name;
    }
}
