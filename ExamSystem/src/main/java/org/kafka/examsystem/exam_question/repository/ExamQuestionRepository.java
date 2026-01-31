package org.kafka.examsystem.exam_question.repository;

import org.kafka.examsystem.exam_question.model.ExamQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {

    /**
     * Belirli bir ID'ye sahip sınav sorusunu, ilgili sınav, ders ve konu bilgileriyle birlikte getirir.
     * Bu metot, servis katmanındaki yetkilendirme kontrolleri için optimize edilmiştir.
     * @param id Sınav sorusu ID'si.
     * @return Sınav sorusu nesnesi (Optional).
     */
    @Query("SELECT eq FROM ExamQuestion eq " +
            "JOIN FETCH eq.exam e " +
            "JOIN FETCH e.course c " +
            "JOIN FETCH eq.topic t " +
            "WHERE eq.id = :id")
    Optional<ExamQuestion> findByIdWithExamCourseAndTopic(@Param("id") Long id);

    /**
     * Belirli bir sınava ve konuya ait soruları sayfalı olarak getirir.
     *
     * @param examId Sınav ID'si.
     * @param topicId Konu ID'si (null olabilir).
     * @param pageable Sayfalama bilgileri.
     * @return Sınav sorularının sayfalı listesi.
     */
    @Query("SELECT eq FROM ExamQuestion eq JOIN FETCH eq.topic t WHERE eq.exam.id = :examId AND (:topicId IS NULL OR eq.topic.id = :topicId)")
    Page<ExamQuestion> findByExamIdAndTopicId(@Param("examId") Long examId, @Param("topicId") Long topicId, Pageable pageable);

    /**
     * Belirli bir ID'ye sahip sınav sorusunu, ilgili sınav ve konu bilgileriyle birlikte getirir.
     * Öğrenci cevaplarının puanlanması için kullanılır.
     * @param id Sınav sorusu ID'si.
     * @return Sınav sorusu nesnesi (Optional).
     */
    @Query("SELECT eq FROM ExamQuestion eq " +
            "JOIN FETCH eq.exam e " +
            "JOIN FETCH eq.topic t " +
            "WHERE eq.id = :id")
    Optional<ExamQuestion> findByIdAndFetchExamAndTopic(@Param("id") Long id);
}
