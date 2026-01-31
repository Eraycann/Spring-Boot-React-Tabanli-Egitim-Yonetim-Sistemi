package org.kafka.examsystem.exam_question.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

/**
 * Sınav sorusu oluşturmak için kullanılan veri transfer objesi.
 */
@Getter
@Setter
public class ExamQuestionCreateRequest {
    private String questionText;
    private List<String> options;
    private String correctAnswer;
    private int score;
    private Long examId;
    private Long topicId;
}
