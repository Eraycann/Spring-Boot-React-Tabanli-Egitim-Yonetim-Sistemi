package org.kafka.examsystem.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kimlik doğrulama başarılı olduğunda istemciye döndürülecek yanıt DTO'su.
 * JWT erişim tokenı, kullanıcının e-postası ve rolünü içerir.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private String role;
}
