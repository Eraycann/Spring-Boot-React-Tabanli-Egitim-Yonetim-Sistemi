package org.kafka.examsystem.course.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kurs bilgilerini istemciye döndürmek için kullanılan DTO.
 * İçerisinde kursun temel bilgilerinin yanı sıra, ilişkili öğretmenin de temel bilgileri bulunur.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String name;
    private Integer gradeLevel;
    private Long teacherId;
    private String teacherFirstName;
    private String teacherLastName;
}