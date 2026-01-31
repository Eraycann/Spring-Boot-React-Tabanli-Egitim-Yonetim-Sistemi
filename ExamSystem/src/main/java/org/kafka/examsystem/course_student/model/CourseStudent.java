package org.kafka.examsystem.course_student.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kafka.examsystem.course.model.Course;
import org.kafka.examsystem.student.model.Student;

/**
 * Kurs ve Öğrenci arasındaki kayıt ilişkisini temsil eden ara varlık.
 * Kendi birincil anahtarı (ID) bulunur.
 */
@Entity
@Table(name = "course_students", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"course_id", "student_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseStudent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // Sadece course ve student ile constructor (ID'yi DB oluşturur)
    public CourseStudent(Course course, Student student) {
        this.course = course;
        this.student = student;
    }
}
