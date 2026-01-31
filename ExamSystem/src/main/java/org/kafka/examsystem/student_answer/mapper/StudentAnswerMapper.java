package org.kafka.examsystem.student_answer.mapper;

import org.kafka.examsystem.student_answer.dto.StudentAnswerCreateRequest;
import org.kafka.examsystem.student_answer.dto.StudentAnswerResponse;
import org.kafka.examsystem.student_answer.model.StudentAnswer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * StudentAnswer entity ile DTO'lar arasındaki dönüşümü sağlayan MapStruct arayüzü.
 */
@Mapper(componentModel = "spring")
public interface StudentAnswerMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "submission", ignore = true)
    @Mapping(target = "question", ignore = true)
    //@Mapping(target = "isCorrect", ignore = true)
    @Mapping(target = "correct", ignore = true)
    @Mapping(target = "score", ignore = true)
    StudentAnswer toStudentAnswer(StudentAnswerCreateRequest request);

    @Mapping(target = "questionText", source = "studentAnswer.question.questionText")
    @Mapping(target = "correctAnswer", source = "studentAnswer.question.correctAnswer")
    StudentAnswerResponse toStudentAnswerResponse(StudentAnswer studentAnswer);

    List<StudentAnswerResponse> toStudentAnswerResponseList(List<StudentAnswer> studentAnswers);
}
