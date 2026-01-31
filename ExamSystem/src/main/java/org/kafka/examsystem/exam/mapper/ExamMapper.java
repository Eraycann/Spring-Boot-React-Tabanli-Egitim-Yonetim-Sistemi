package org.kafka.examsystem.exam.mapper;


import org.kafka.examsystem.exam.dto.ExamResponse;
import org.kafka.examsystem.exam.model.Exam;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Exam varlığı ile DTO'lar arasında dönüşüm sağlayan MapStruct Mapper.
 */
@Mapper(componentModel = "spring")
public interface ExamMapper {

    @Mapping(target = "courseId", source = "course.id")
    @Mapping(target = "courseName", source = "course.name")
    ExamResponse toExamResponse(Exam exam);

    List<ExamResponse> toExamResponseList(List<Exam> exams);
}