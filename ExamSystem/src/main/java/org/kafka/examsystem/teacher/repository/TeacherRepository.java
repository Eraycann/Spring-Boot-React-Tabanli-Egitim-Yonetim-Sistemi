package org.kafka.examsystem.teacher.repository;

import org.kafka.examsystem.teacher.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Öğretmen varlığı için JPA deposu.
 */
@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserId(Long userId);
}