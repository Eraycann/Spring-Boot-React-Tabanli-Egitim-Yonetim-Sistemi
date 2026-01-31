package org.kafka.examsystem.student_answer.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.kafka.examsystem.exam_question.model.ExamQuestion;
import org.kafka.examsystem.exam_submission.model.ExamSubmission;

/**
 * Öğrencilerin bir sınavdaki sorulara verdiği cevapları temsil eden JPA varlığı.
 */
@Entity
@Table(name = "student_answers")
@Getter
@Setter
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cevabın ait olduğu sınav gönderimi (submission)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private ExamSubmission submission;

    // Cevabın ait olduğu sınav sorusu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private ExamQuestion question;

    // Öğrencinin verdiği cevap
    @Column(nullable = false, length = 1000)
    private String givenAnswer;

    // Cevabın doğru olup olmadığı
    @Column(nullable = false)
    private boolean isCorrect;

    // Bu sorudan kazanılan puan
    @Column(nullable = false)
    private int score;
}
