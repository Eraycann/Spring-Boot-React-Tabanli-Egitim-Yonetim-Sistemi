package org.kafka.examsystem.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.kafka.examsystem.exam.model.Exam;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import java.util.List;

/**
 * Yeni bir sınav oluşturmak için kullanılan DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamCreateRequest {
    private String name;
    private int durationInMinutes;
    private Long courseId;
}