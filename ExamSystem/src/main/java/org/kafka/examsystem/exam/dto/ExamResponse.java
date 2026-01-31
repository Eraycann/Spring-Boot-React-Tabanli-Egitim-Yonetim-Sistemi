package org.kafka.examsystem.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * İstemciye dönülecek sınav bilgilerini içeren DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponse {
    private Long id;
    private String name;
    private int durationInMinutes;
    private boolean isActive;
    private Long courseId;
    private String courseName;
}