package org.kafka.examsystem.course.model;

import org.kafka.examsystem.course_student.model.CourseStudent;
import org.kafka.examsystem.teacher.model.Teacher;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * Kurs varlığı. Öğretmenler tarafından oluşturulur ve belirli bir sınıf seviyesine sahiptir.
 */
@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    // CourseStudent ara varlığına OneToMany ilişki
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<CourseStudent> courseStudents = new HashSet<>(); // Bu kursa kayıtlı öğrenciler (ara tablo üzerinden)
}