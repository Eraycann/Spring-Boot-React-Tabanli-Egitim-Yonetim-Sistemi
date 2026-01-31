package org.kafka.examsystem.exam.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.kafka.examsystem.course.model.Course;

import java.time.LocalDateTime;

/**
 * Derslere ait sınavları temsil eden varlık.
 * Her sınav, bir derse aittir (Many-to-One).
 */
@Entity
@Table(name = "exams")
@Getter
@Setter
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int durationInMinutes; // Sınav süresi (dakika)

    @Column(nullable = false)
    private boolean isActive = false; // Sınavın aktiflik durumu, varsayılan olarak pasif.

    // Sınavın başlatıldığı zamanı tutar, süre dolunca pasif hale getirmek için kullanılır.
    private LocalDateTime startTime;

    // Bir sınav, bir derse aittir.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}
