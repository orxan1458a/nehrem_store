package com.nehrem.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class UserDTO {

    @Data
    public static class ChangePasswordRequest {

        @NotBlank(message = "Cari şifrə tələb olunur")
        private String currentPassword;

        @NotBlank(message = "Yeni şifrə tələb olunur")
        @Size(min = 6, message = "Yeni şifrə ən az 6 simvol olmalıdır")
        private String newPassword;

        @NotBlank(message = "Şifrənin təkrarı tələb olunur")
        private String confirmPassword;
    }
}
