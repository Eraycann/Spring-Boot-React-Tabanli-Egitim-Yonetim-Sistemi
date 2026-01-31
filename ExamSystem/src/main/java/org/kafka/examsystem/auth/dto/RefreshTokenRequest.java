package org.kafka.examsystem.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    @NotBlank(message = "Yenileme tokenı boş olamaz.")
    private String refreshToken;
}