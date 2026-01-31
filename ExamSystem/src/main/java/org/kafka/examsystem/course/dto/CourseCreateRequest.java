package org.kafka.examsystem.course.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Yeni bir kurs oluşturmak için istek gövdesi DTO'su.
 * Öğretmen ID'si, giriş yapan kullanıcının bağlamından alınacağı için bu DTO'dan kaldırılmıştır.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseCreateRequest {
    @NotBlank(message = "Kurs adı boş bırakılamaz.")
    private String name;

    @NotNull(message = "Sınıf seviyesi boş bırakılamaz.")
    @Min(value = 1, message = "Sınıf seviyesi 1'den küçük olamaz.")
    @Max(value = 12, message = "Sınıf seviyesi 12'den büyük olamaz.")
    private Integer gradeLevel;
}
