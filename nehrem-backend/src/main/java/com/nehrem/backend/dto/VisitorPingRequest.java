package com.nehrem.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VisitorPingRequest {
    @NotBlank
    private String deviceId;
}
