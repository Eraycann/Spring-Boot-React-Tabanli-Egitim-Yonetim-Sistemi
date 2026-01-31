package org.kafka.examsystem.student_answer.dto;

import lombok.Getter;
import lombok.Setter;
import org.kafka.examsystem.exam_question.dto.ExamQuestionResponse;

/**
 * Öğrenci cevabı oluşturmak için kullanılan veri transfer objesi.
 */
@Getter
@Setter
public class StudentAnswerCreateRequest {
    private Long submissionId;
    private Long questionId;
    private String givenAnswer;
}