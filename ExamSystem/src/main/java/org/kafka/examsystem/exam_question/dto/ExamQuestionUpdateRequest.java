package org.kafka.examsystem.exam_question.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

/**
 * Sınav sorusu güncellemek için kullanılan veri transfer objesi.
 */
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExamQuestionUpdateRequest {
    private String questionText;
    private List<String> options;
    private String correctAnswer;
    private int score;
    private Long topicId;
}

