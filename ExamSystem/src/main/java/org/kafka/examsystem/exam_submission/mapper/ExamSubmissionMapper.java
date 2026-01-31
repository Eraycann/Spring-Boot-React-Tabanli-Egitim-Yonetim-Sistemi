package org.kafka.examsystem.exam_submission.mapper;

import org.kafka.examsystem.exam_submission.dto.ExamSubmissionResponse;
import org.kafka.examsystem.exam_submission.model.ExamSubmission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * ExamSubmission varlığı ile DTO'lar arasında dönüşüm sağlayan MapStruct Mapper.
 */
@Mapper(componentModel = "spring")
public interface ExamSubmissionMapper {


    @Mapping(target = "examId", source = "exam.id")
    @Mapping(target = "examName", source = "exam.name")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.firstName")
    ExamSubmissionResponse toExamSubmissionResponse(ExamSubmission submission);
}