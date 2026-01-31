package org.kafka.examsystem.student_answer.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Öğrenci cevabını yanıt olarak döndürmek için kullanılan basitleştirilmiş veri transfer objesi.
 * Soru bilgilerini doğrudan içerir.
 */
@Getter
@Setter
public class StudentAnswerResponse {
    private Long id;
    private String givenAnswer;
    private boolean isCorrect;
    private int score;
    private String questionText;
    private String correctAnswer;
}