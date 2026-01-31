package org.kafka.examsystem.exam_submission.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.kafka.examsystem.exam.model.Exam;
import org.kafka.examsystem.student.model.Student;
import org.kafka.examsystem.user.model.User;

import java.time.LocalDateTime;

/**
 * Öğrencilerin sınav girişlerini yöneten varlık.
 * Bir öğrencinin bir sınava başladığı anı ve sonucunu kaydeder.
 */
@Entity
@Table(name = "exam_submissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"exam_id", "student_id"}, name = "uk_exam_submission_exam_student")
})
@Getter
@Setter
public class ExamSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Bir sınav girişi, bir sınava aittir.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    // Bir sınav girişi, bir öğrenciye aittir.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // Sınavın tamamlanıp gönderildiği zamanı tutar. Sınav devam ederken null'dır.
    private LocalDateTime submittedAt;

    /**
     * Sınavdan alınan toplam puan.
     * Bu alan, başlangıçta 0'a ayarlanır. Bu sayede getter metoduna gerek kalmaz.
     */
    @Column(nullable = false)
    private Integer totalScore = 0;
}
