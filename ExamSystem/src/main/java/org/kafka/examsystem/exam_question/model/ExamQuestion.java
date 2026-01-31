package org.kafka.examsystem.exam_question.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.kafka.examsystem.exam.model.Exam;
import org.kafka.examsystem.topic.model.Topic;

/**
 * Sınav sorularını temsil eden JPA varlığı.
 * Her soru bir sınava ve bir konuya bağlıdır.
 */
@Entity
@Table(name = "exam_questions")
@Getter
@Setter
public class ExamQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String questionText;

    /**
     * Sorunun şıklarını JSON formatında bir String olarak saklar.
     * Örneğin: ["Seçenek A", "Seçenek B", "Seçenek C"]
     * Dönüşüm, ExamQuestionMapper'da MapStruct ve ObjectMapper kullanılarak yapılır.
     */
    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(nullable = false)
    private String correctAnswer;

    /**
     * Soru başına verilecek puanı belirtir.
     */
    @Column(nullable = false)
    private int score;

    // Bir soru bir sınava aittir.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    // Bir soru bir konuya aittir.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;
}
