package org.kafka.examsystem.student.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kafka.examsystem.course_student.model.CourseStudent;
import org.kafka.examsystem.parent.model.Parent;
import org.kafka.examsystem.user.model.User;

import java.util.HashSet;
import java.util.Set;

/**
 * Öğrenci varlığı. Bir veliye (Parent) bağlıdır.
 */
@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor // AllArgsConstructor eklendi
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<CourseStudent> courseStudents = new HashSet<>(); // Kayıtlı olduğu kurslar (ara tablo üzerinden)
}