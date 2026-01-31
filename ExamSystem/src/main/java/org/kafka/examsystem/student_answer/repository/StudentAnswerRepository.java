package org.kafka.examsystem.student_answer.repository;

import org.kafka.examsystem.student_answer.model.StudentAnswer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {

    /**
     * Belirli bir sınav gönderimine (submission) ait tüm cevapları getirir.
     * Öğrencinin kendi cevaplarını görmesi için kullanılır.
     * @param submissionId Sınav gönderim ID'si.
     * @param pageable Sayfalama bilgileri.
     * @return Sayfalı öğrenci cevapları listesi.
     */
    @Query("SELECT sa FROM StudentAnswer sa JOIN FETCH sa.question q WHERE sa.submission.id = :submissionId")
    Page<StudentAnswer> findBySubmissionId(@Param("submissionId") Long submissionId, Pageable pageable);

    /**
     * Belirli bir sınava ait tüm öğrencilerin cevaplarını getirir.
     * Admin yetkisine sahip kullanıcılar için tüm cevapları listelemek amacıyla kullanılır.
     * @param examId Sınav ID'si.
     * @param pageable Sayfalama bilgileri.
     * @return Sayfalı öğrenci cevapları listesi.
     */
    @Query("SELECT sa FROM StudentAnswer sa JOIN FETCH sa.submission s JOIN FETCH s.student WHERE s.exam.id = :examId")
    Page<StudentAnswer> findByExamId(@Param("examId") Long examId, Pageable pageable);
}
