package org.kafka.examsystem.course_student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Öğrenci bilgilerini özet olarak döndürmek için kullanılan DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseStudentSummaryDto {
    private Long id;
    private String firstName;
    private String lastName;
    private Integer gradeLevel;
}