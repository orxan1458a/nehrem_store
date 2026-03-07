package com.nehrem.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class CourierDTO {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Ad tələb olunur")
        @Size(max = 100)
        private String name;

        @Size(max = 20)
        private String phone;

        @NotBlank(message = "İstifadəçi adı tələb olunur")
        @Size(max = 50)
        private String username;

        /** Required on create; optional on update (null = keep existing). */
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String phone;
        private String username;
        private Boolean active;
        private LocalDateTime createdAt;
    }
}
