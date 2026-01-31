package org.kafka.examsystem.student.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Öğrencinin temel kimlik bilgilerini (ad, soyad, id) içeren DTO sınıfı.
 * API'den dönecek veriyi sınırlar.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentMinimalResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private Integer gradeLevel;
}
