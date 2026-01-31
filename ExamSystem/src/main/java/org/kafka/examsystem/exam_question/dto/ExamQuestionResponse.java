package org.kafka.examsystem.exam_question.dto;

import lombok.Getter;
import lombok.Setter;
import org.kafka.examsystem.topic.dto.TopicResponse;
import java.util.List;

/**
 * Sınav sorusunu yanıt olarak döndürmek için kullanılan veri transfer objesi.
 */
@Getter
@Setter
public class ExamQuestionResponse {
    private Long id;
    private String questionText;
    private List<String> options;
    private String correctAnswer;
    private int score;
    private Long examId;
    private String topicName;
}
