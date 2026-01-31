package org.kafka.examsystem.course_student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Bir öğrencinin kayıtlı olduğu kurs bilgilerini döndürmek için kullanılan DTO.
 * İçerisinde kursun temel bilgilerinin yanı sıra, ilişkili öğretmenin de temel bilgileri bulunur.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrolledCourseResponse {
    private Long id;
    private String name;
    private Integer gradeLevel;
    private Long teacherId;
    private String teacherFirstName;
    private String teacherLastName;
}
