package org.kafka.examsystem.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Öğretmen kaydı için istek gövdesi DTO'su.
 * Öğretmen bilgilerini içerir ve validasyon kuralları uygulanmıştır.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterTeacherRequest {
    @NotBlank(message = "Email alanı boş bırakılamaz.")
    @Email(message = "Geçerli bir e-posta adresi giriniz.")
    private String email;

    @NotBlank(message = "Şifre alanı boş bırakılamaz.")
    @Size(min = 6, max = 20, message = "Şifre 6 ile 20 karakter arasında olmalıdır.")
    private String password;

    @NotBlank(message = "Ad alanı boş bırakılamaz.")
    private String firstName;

    @NotBlank(message = "Soyad alanı boş bırakılamaz.")
    private String lastName;

    @NotBlank(message = "Branş alanı boş bırakılamaz.")
    private String branch;
}
