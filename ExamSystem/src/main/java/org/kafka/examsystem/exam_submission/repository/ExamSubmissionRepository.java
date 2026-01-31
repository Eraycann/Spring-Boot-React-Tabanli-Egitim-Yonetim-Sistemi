package org.kafka.examsystem.exam_submission.repository;

import org.kafka.examsystem.exam_submission.model.ExamSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {

    /**
     * Belirli bir öğrenci ve sınava ait aktif (henüz gönderilmemiş) sınav girişini bulur.
     * Bu metot, öğrencinin aynı sınava tekrar girmesini engellemek için kullanılır.
     * @param studentId Öğrencinin ID'si.
     * @param examId Sınavın ID'si.
     * @return Sınav girişi nesnesi (Optional).
     */
    Optional<ExamSubmission> findByStudentIdAndExamIdAndSubmittedAtIsNull(Long studentId, Long examId);

    /**
     * Sınav girişini, ilgili sınav (exam), ders (course) ve öğrenci (student) verileriyle birlikte getirir.
     * @param id Sınav girişi ID'si.
     * @return Sınav girişi nesnesi (Optional).
     */
    @Query("SELECT es FROM ExamSubmission es " +
            "JOIN FETCH es.exam e " +
            "JOIN FETCH e.course c " +
            "JOIN FETCH es.student s " +
            "WHERE es.id = :id")
    Optional<ExamSubmission> findByIdWithDetails(@Param("id") Long id);

    /**
     * Sınav girişlerini çeşitli parametrelere göre filtreleyerek sayfalı olarak getirir.
     * Bu sorgu, ADMIN, TEACHER, STUDENT ve PARENT rollerine göre filtreleme yapmak için
     * servis katmanında kullanılır.
     *
     * @param examId Filtrelemek için sınav ID'si (null olabilir).
     * @param courseId Filtrelemek için ders ID'si (null olabilir).
     * @param studentId Filtrelemek için öğrenci ID'si (null olabilir).
     * @param teacherId Filtrelemek için öğretmen ID'si (null olabilir).
     * @param studentIds Filtrelemek için öğrenci ID'lerinin listesi (null olabilir).
     * @param pageable Sayfalama bilgileri.
     * @return Filtrelenmiş sınav girişlerinin sayfalı listesi.
     */
    @Query("SELECT es FROM ExamSubmission es " +
            "JOIN FETCH es.exam e " +
            "JOIN FETCH es.student s " +
            "JOIN FETCH e.course c " +
            "WHERE (:examId IS NULL OR e.id = :examId) " +
            "AND (:courseId IS NULL OR c.id = :courseId) " +
            "AND (:studentId IS NULL OR s.id = :studentId) " +
            "AND (:teacherId IS NULL OR c.teacher.id = :teacherId) " +
            "AND (COALESCE(:studentIds, NULL) IS NULL OR s.id IN :studentIds)")
    Page<ExamSubmission> searchAllSubmissions(
            @Param("examId") Long examId,
            @Param("courseId") Long courseId,
            @Param("studentId") Long studentId,
            @Param("teacherId") Long teacherId,
            @Param("studentIds") List<Long> studentIds,
            Pageable pageable);
}
