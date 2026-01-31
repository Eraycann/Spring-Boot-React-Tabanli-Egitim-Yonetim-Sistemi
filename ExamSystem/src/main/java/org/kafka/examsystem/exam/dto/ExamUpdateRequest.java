package org.kafka.examsystem.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Sınavı güncellemek için kullanılan DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamUpdateRequest {
    private String name;
    private int durationInMinutes;
}