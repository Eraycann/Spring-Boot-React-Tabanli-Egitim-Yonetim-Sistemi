package org.kafka.examsystem.topic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.kafka.examsystem.course.model.Course;

/**
 * Kurslara ait konuları temsil eden varlık.
 * Her konu, bir kursa aittir (Many-to-One).
 */
@Entity
@Table(name = "topics")
@Getter
@Setter
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Bir konu, bir kursa aittir.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}
