package org.kafka.examsystem.auth.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Veli ve öğrenci kaydı için istek gövdesi DTO'su.
 * Veli ve öğrenci bilgilerini içerir ve validasyon kuralları uygulanmıştır.
 * Şimdi öğrencinin de kendi e-posta ve şifre alanları var.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterParentRequest {
    @NotBlank(message = "Veli Email alanı boş bırakılamaz.")
    @Email(message = "Geçerli bir veli e-posta adresi giriniz.")
    private String email; // Veli e-postası

    @NotBlank(message = "Veli Şifre alanı boş bırakılamaz.")
    @Size(min = 6, max = 20, message = "Veli şifresi 6 ile 20 karakter arasında olmalıdır.")
    private String password; // Veli şifresi

    @NotBlank(message = "Veli adı boş bırakılamaz.")
    private String parentFirstName;

    @NotBlank(message = "Veli soyadı boş bırakılamaz.")
    private String parentLastName;

    @NotBlank(message = "Öğrenci Email alanı boş bırakılamaz.")
    @Email(message = "Geçerli bir öğrenci e-posta adresi giriniz.")
    private String studentEmail; // Öğrenci e-postası

    @NotBlank(message = "Öğrenci Şifre alanı boş bırakılamaz.")
    @Size(min = 6, max = 20, message = "Öğrenci şifresi 6 ile 20 karakter arasında olmalıdır.")
    private String studentPassword; // Öğrenci şifresi

    @NotBlank(message = "Öğrenci adı boş bırakılamaz.")
    private String studentFirstName;

    @NotBlank(message = "Öğrenci soyadı boş bırakılamaz.")
    private String studentLastName;

    @NotNull(message = "Öğrenci sınıfı boş bırakılamaz.")
    @Min(value = 1, message = "Öğrenci sınıfı en az 1 olabilir.")
    @Max(value = 12, message = "Öğrenci sınıfı en fazla 12 olabilir.")
    private Integer gradeLevel;
}